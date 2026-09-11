"""Integration tests for project and activity REST endpoints."""

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

DEFAULT_ACTIVITY_PAYLOAD = {
    "name": "Build module",
    "budget_at_completion": "1000.00",
    "planned_progress_percentage": "50.00",
    "actual_progress_percentage": "40.00",
    "actual_cost": "400.00",
}


def _create_project(client: TestClient, *, name: str = "Project Alpha") -> dict:
    response = client.post(
        "/api/v1/projects",
        json={"name": name, "description": "For activities"},
    )
    assert response.status_code == 201
    return response.json()


def _create_activity(
    client: TestClient,
    project_id: str,
    payload: dict | None = None,
) -> dict:
    response = client.post(
        f"/api/v1/projects/{project_id}/activities",
        json=payload or DEFAULT_ACTIVITY_PAYLOAD,
    )
    assert response.status_code == 201
    return response.json()


def _assert_activity_with_indicators(data: dict) -> None:
    assert data["project_id"]
    assert "indicators" in data
    for field in EVM_INDICATOR_FIELDS:
        assert field in data["indicators"]


class TestActivitiesApiHappyPath:
    def test_create_activity_returns_201(self, client: TestClient) -> None:
        project = _create_project(client)

        data = _create_activity(client, project["id"])

        assert data["name"] == DEFAULT_ACTIVITY_PAYLOAD["name"]
        assert data["project_id"] == project["id"]
        _assert_activity_with_indicators(data)

    def test_list_activities_returns_200_with_indicators(self, client: TestClient) -> None:
        project = _create_project(client)
        created = _create_activity(client, project["id"])

        response = client.get(f"/api/v1/projects/{project['id']}/activities")

        assert response.status_code == 200
        activities = response.json()
        assert isinstance(activities, list)
        assert len(activities) == 1
        assert activities[0]["id"] == created["id"]
        _assert_activity_with_indicators(activities[0])

    def test_get_activity_returns_200_with_indicators(self, client: TestClient) -> None:
        project = _create_project(client)
        created = _create_activity(client, project["id"])

        response = client.get(f"/api/v1/activities/{created['id']}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == created["id"]
        _assert_activity_with_indicators(data)

    def test_update_activity_returns_200(self, client: TestClient) -> None:
        project = _create_project(client)
        created = _create_activity(client, project["id"])

        response = client.put(
            f"/api/v1/activities/{created['id']}",
            json={
                "name": "Updated activity",
                "budget_at_completion": "2000.00",
                "planned_progress_percentage": "60.00",
                "actual_progress_percentage": "55.00",
                "actual_cost": "900.00",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == created["id"]
        assert data["name"] == "Updated activity"
        assert data["budget_at_completion"] == 2000.0
        _assert_activity_with_indicators(data)

    def test_delete_activity_returns_204(self, client: TestClient) -> None:
        project = _create_project(client)
        created = _create_activity(client, project["id"])

        response = client.delete(f"/api/v1/activities/{created['id']}")

        assert response.status_code == 204
        assert response.content == b""

        get_response = client.get(f"/api/v1/activities/{created['id']}")
        assert get_response.status_code == 404


class TestActivitiesApiErrorCases:
    def test_create_activity_with_nonexistent_project_returns_404_ec07(
        self, client: TestClient
    ) -> None:
        missing_project_id = uuid4()

        response = client.post(
            f"/api/v1/projects/{missing_project_id}/activities",
            json=DEFAULT_ACTIVITY_PAYLOAD,
        )

        assert response.status_code == 404
        assert "detail" in response.json()

    def test_create_activity_with_invalid_percentages_returns_422_ec08(
        self, client: TestClient
    ) -> None:
        project = _create_project(client)
        invalid_payload = {
            **DEFAULT_ACTIVITY_PAYLOAD,
            "planned_progress_percentage": "150.00",
        }

        response = client.post(
            f"/api/v1/projects/{project['id']}/activities",
            json=invalid_payload,
        )

        assert response.status_code == 422
        assert "detail" in response.json()

    def test_create_activity_with_negative_bac_returns_422_ec09(
        self, client: TestClient
    ) -> None:
        project = _create_project(client)
        invalid_payload = {
            **DEFAULT_ACTIVITY_PAYLOAD,
            "budget_at_completion": "-100.00",
        }

        response = client.post(
            f"/api/v1/projects/{project['id']}/activities",
            json=invalid_payload,
        )

        assert response.status_code == 422
        assert "detail" in response.json()
