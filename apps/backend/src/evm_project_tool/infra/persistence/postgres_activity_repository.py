from datetime import UTC, datetime
from uuid import UUID

from psycopg.errors import CheckViolation, ForeignKeyViolation
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from evm_project_tool.application.exceptions import NotFoundError, ValidationError
from evm_project_tool.application.ports import ActivityRepository
from evm_project_tool.domain import Activity
from evm_project_tool.infra.persistence.mappers import (
    activity_to_params,
    row_to_activity,
)

_ACTIVITY_COLUMNS = (
    "id, project_id, name, budget_at_completion, planned_progress_percentage, "
    "actual_progress_percentage, actual_cost, created_at, updated_at"
)


class PostgresActivityRepository(ActivityRepository):
    def __init__(self, pool: ConnectionPool) -> None:
        self._pool = pool

    def create(self, activity: Activity) -> Activity:
        now = datetime.now(UTC)
        activity_with_timestamps = Activity.create(
            id=activity.id,
            projectId=activity.projectId,
            name=activity.name,
            budgetAtCompletion=activity.budgetAtCompletion.value,
            plannedProgressPercentage=activity.plannedProgressPercentage.value,
            actualProgressPercentage=activity.actualProgressPercentage.value,
            actualCost=activity.actualCost.value,
            createdAt=now,
            updatedAt=now,
        )
        params = activity_to_params(activity_with_timestamps)
        try:
            with self._pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as cur:
                    cur.execute(
                        f"""
                        INSERT INTO activities (
                            id, project_id, name, budget_at_completion,
                            planned_progress_percentage, actual_progress_percentage,
                            actual_cost, created_at, updated_at
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING {_ACTIVITY_COLUMNS}
                        """,
                        params,
                    )
                    row = cur.fetchone()
                conn.commit()
        except ForeignKeyViolation as exc:
            raise NotFoundError(f"Project {activity.projectId} not found") from exc
        except CheckViolation as exc:
            raise ValidationError(str(exc)) from exc
        assert row is not None
        return row_to_activity(row)

    def get_by_id(self, activity_id: UUID) -> Activity | None:
        with self._pool.connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    f"SELECT {_ACTIVITY_COLUMNS} FROM activities WHERE id = %s",
                    (activity_id,),
                )
                row = cur.fetchone()
        if row is None:
            return None
        return row_to_activity(row)

    def list_by_project_id(self, project_id: UUID) -> list[Activity]:
        with self._pool.connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    f"""
                    SELECT {_ACTIVITY_COLUMNS}
                    FROM activities
                    WHERE project_id = %s
                    ORDER BY created_at
                    """,
                    (project_id,),
                )
                rows = cur.fetchall()
        return [row_to_activity(row) for row in rows]

    def update(self, activity: Activity) -> Activity:
        updated_at = datetime.now(UTC)
        params = (
            activity.name,
            activity.budgetAtCompletion.value,
            activity.plannedProgressPercentage.value,
            activity.actualProgressPercentage.value,
            activity.actualCost.value,
            updated_at,
            activity.id,
        )
        try:
            with self._pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as cur:
                    cur.execute(
                        f"""
                        UPDATE activities
                        SET name = %s,
                            budget_at_completion = %s,
                            planned_progress_percentage = %s,
                            actual_progress_percentage = %s,
                            actual_cost = %s,
                            updated_at = %s
                        WHERE id = %s
                        RETURNING {_ACTIVITY_COLUMNS}
                        """,
                        params,
                    )
                    row = cur.fetchone()
                conn.commit()
        except CheckViolation as exc:
            raise ValidationError(str(exc)) from exc
        assert row is not None
        return row_to_activity(row)

    def delete(self, activity_id: UUID) -> bool:
        with self._pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM activities WHERE id = %s", (activity_id,))
                deleted = cur.rowcount > 0
            conn.commit()
        return deleted

    def exists_project(self, project_id: UUID) -> bool:
        with self._pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT EXISTS(SELECT 1 FROM projects WHERE id = %s)",
                    (project_id,),
                )
                row = cur.fetchone()
        return bool(row[0]) if row is not None else False
