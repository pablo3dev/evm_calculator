"""Integration tests for /api/v1/projects endpoints."""

from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration

EVM_INDICATOR_FIELDS = (
    "pv",
    "ev",
    "cv",
    "sv",
    "cpi",
    "spi",
    "eac",
    "vac",
    "cpi_interpretation",
    "spi_interpretation",
)


def _create_project(
    client: TestClient,
    *,
    name: str = "Alpha Project",
    description: str | None = "Test description",
) -> dict:
    response = client.post(
        "/api/v1/projects",
        json={"name": name, "description": description},
    )
    assert response.status_code == 201
    return response.json()


def _assert_evm_indicators(indicators: dict) -> None:
    for field in EVM_INDICATOR_FIELDS:
        assert field in indicators


class TestProjectsApiHappyPath:
    def test_create_project_returns_201(self, client: TestClient) -> None:
        data = _create_project(client, name="New Project")

        assert data["name"] == "New Project"
        assert data["description"] == "Test description"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_list_projects_returns_200(self, client: TestClient) -> None:
        created = _create_project(client, name="Listed Project")

        response = client.get("/api/v1/projects")

        assert response.status_code == 200
        projects = response.json()
        assert isinstance(projects, list)
        assert any(project["id"] == created["id"] for project in projects)

    def test_get_project_returns_200_with_consolidated_indicators(
        self, client: TestClient
    ) -> None:
        created = _create_project(client, name="Detail Project")

        response = client.get(f"/api/v1/projects/{created['id']}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == created["id"]
        assert data["name"] == "Detail Project"
        assert "consolidated_indicators" in data
        _assert_evm_indicators(data["consolidated_indicators"])

    def test_update_project_returns_200(self, client: TestClient) -> None:
        created = _create_project(client, name="Before Update")

        response = client.put(
            f"/api/v1/projects/{created['id']}",
            json={"name": "After Update", "description": "Updated"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == created["id"]
        assert data["name"] == "After Update"
        assert data["description"] == "Updated"

    def test_delete_project_returns_204(self, client: TestClient) -> None:
        created = _create_project(client, name="To Delete")

        response = client.delete(f"/api/v1/projects/{created['id']}")

        assert response.status_code == 204
        assert response.content == b""

        get_response = client.get(f"/api/v1/projects/{created['id']}")
        assert get_response.status_code == 404


class TestProjectsApiErrorCases:
    def test_delete_nonexistent_project_returns_404(self, client: TestClient) -> None:
        missing_id = uuid4()

        response = client.delete(f"/api/v1/projects/{missing_id}")

        assert response.status_code == 404
        assert "detail" in response.json()

    def test_create_project_with_empty_name_returns_422(self, client: TestClient) -> None:
        response = client.post(
            "/api/v1/projects",
            json={"name": "", "description": "invalid"},
        )

        assert response.status_code == 422
        assert "detail" in response.json()
