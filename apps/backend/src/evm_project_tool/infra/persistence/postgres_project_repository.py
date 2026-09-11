from datetime import UTC, datetime
from uuid import UUID

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from evm_project_tool.application.ports import ProjectRepository
from evm_project_tool.domain import Project
from evm_project_tool.infra.persistence.mappers import project_to_params, row_to_project

_PROJECT_COLUMNS = "id, name, description, created_at, updated_at"


class PostgresProjectRepository(ProjectRepository):
    def __init__(self, pool: ConnectionPool) -> None:
        self._pool = pool

    def create(self, project: Project) -> Project:
        now = datetime.now(UTC)
        project_with_timestamps = Project(
            id=project.id,
            name=project.name,
            description=project.description,
            createdAt=now,
            updatedAt=now,
        )
        params = project_to_params(project_with_timestamps)
        with self._pool.connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    f"""
                    INSERT INTO projects (id, name, description, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING {_PROJECT_COLUMNS}
                    """,
                    params,
                )
                row = cur.fetchone()
            conn.commit()
        assert row is not None
        return row_to_project(row)

    def get_by_id(self, project_id: UUID) -> Project | None:
        with self._pool.connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    f"SELECT {_PROJECT_COLUMNS} FROM projects WHERE id = %s",
                    (project_id,),
                )
                row = cur.fetchone()
        if row is None:
            return None
        return row_to_project(row)

    def list_all(self) -> list[Project]:
        with self._pool.connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    f"SELECT {_PROJECT_COLUMNS} FROM projects ORDER BY created_at"
                )
                rows = cur.fetchall()
        return [row_to_project(row) for row in rows]

    def update(self, project: Project) -> Project:
        updated_at = datetime.now(UTC)
        params = (
            project.name,
            project.description,
            updated_at,
            project.id,
        )
        with self._pool.connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    f"""
                    UPDATE projects
                    SET name = %s, description = %s, updated_at = %s
                    WHERE id = %s
                    RETURNING {_PROJECT_COLUMNS}
                    """,
                    params,
                )
                row = cur.fetchone()
            conn.commit()
        assert row is not None
        return row_to_project(row)

    def delete(self, project_id: UUID) -> bool:
        with self._pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM projects WHERE id = %s", (project_id,))
                deleted = cur.rowcount > 0
            conn.commit()
        return deleted
