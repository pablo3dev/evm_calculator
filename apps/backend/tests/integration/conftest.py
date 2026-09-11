"""Integration test fixtures: real PostgreSQL via DATABASE_URL or Docker."""

from __future__ import annotations

import os
import subprocess
import time
from collections.abc import Generator, Iterator
from pathlib import Path

import psycopg
import pytest
from fastapi.testclient import TestClient

from evm_project_tool.infra.http.main import create_app

MIGRATIONS_DIR = Path(__file__).resolve().parents[3] / "db" / "migrations"
DOCKER_IMAGE = "postgres:18"
DOCKER_PORT = 15432
DOCKER_USER = "evm"
DOCKER_PASSWORD = "evm"
DOCKER_DB = "evm_test"
POSTGRES_SKIP_MESSAGE = (
    "PostgreSQL is not reachable. Set DATABASE_URL to a running instance "
    "or install Docker to start postgres:18 automatically."
)


def _docker_available() -> bool:
    try:
        result = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            timeout=10,
            check=False,
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return False


def _can_connect(database_url: str, *, timeout: float = 3) -> bool:
    try:
        with psycopg.connect(database_url, connect_timeout=timeout) as conn:
            conn.execute("SELECT 1")
        return True
    except Exception:
        return False


def _wait_for_postgres(database_url: str, *, attempts: int = 30) -> None:
    for _ in range(attempts):
        if _can_connect(database_url, timeout=2):
            return
        time.sleep(1)
    msg = f"PostgreSQL did not become ready at {database_url!r}"
    raise RuntimeError(msg)


def _migration_sql_files() -> list[Path]:
    return sorted(
        path
        for path in MIGRATIONS_DIR.glob("*.sql")
        if not path.name.endswith(".rollback.sql")
    )


def _apply_migrations(database_url: str) -> None:
    with psycopg.connect(database_url, autocommit=True) as conn:
        conn.execute("DROP SCHEMA IF EXISTS public CASCADE")
        conn.execute("CREATE SCHEMA public")
        conn.execute("GRANT ALL ON SCHEMA public TO public")
        for path in _migration_sql_files():
            conn.execute(path.read_text(encoding="utf-8"))


def _truncate_tables(database_url: str) -> None:
    with psycopg.connect(database_url, autocommit=True) as conn:
        conn.execute(
            "TRUNCATE TABLE activities, projects RESTART IDENTITY CASCADE"
        )


def _start_docker_postgres(container_name: str) -> str:
    subprocess.run(
        [
            "docker",
            "run",
            "-d",
            "--name",
            container_name,
            "-e",
            f"POSTGRES_USER={DOCKER_USER}",
            "-e",
            f"POSTGRES_PASSWORD={DOCKER_PASSWORD}",
            "-e",
            f"POSTGRES_DB={DOCKER_DB}",
            "-p",
            f"{DOCKER_PORT}:5432",
            DOCKER_IMAGE,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return (
        f"postgresql://{DOCKER_USER}:{DOCKER_PASSWORD}"
        f"@127.0.0.1:{DOCKER_PORT}/{DOCKER_DB}"
    )


def _stop_docker_postgres(container_name: str) -> None:
    subprocess.run(
        ["docker", "rm", "-f", container_name],
        capture_output=True,
        check=False,
    )


@pytest.fixture(scope="session")
def database_url() -> Generator[str, None, None]:
    env_url = os.environ.get("DATABASE_URL")
    container_name: str | None = None

    if env_url:
        if not _can_connect(env_url):
            pytest.skip(
                "DATABASE_URL is set but PostgreSQL is not reachable at that URL."
            )
        yield env_url
        return

    if not _docker_available():
        pytest.skip(POSTGRES_SKIP_MESSAGE)

    container_name = f"evm_integration_pg_{os.getpid()}"
    _stop_docker_postgres(container_name)

    try:
        url = _start_docker_postgres(container_name)
        _wait_for_postgres(url)
        yield url
    except (subprocess.CalledProcessError, RuntimeError, OSError):
        pytest.skip(POSTGRES_SKIP_MESSAGE)
    finally:
        if container_name is not None:
            _stop_docker_postgres(container_name)


@pytest.fixture(scope="session")
def _migrations_applied(database_url: str) -> str:
    _apply_migrations(database_url)
    return database_url


@pytest.fixture(autouse=True)
def _clean_tables(database_url: str, _migrations_applied: str) -> Iterator[None]:
    _truncate_tables(database_url)
    yield
    _truncate_tables(database_url)


@pytest.fixture
def client(
    database_url: str, _migrations_applied: str
) -> Generator[TestClient, None, None]:
    os.environ["DATABASE_URL"] = database_url
    app = create_app()
    with TestClient(app) as http_client:
        yield http_client
