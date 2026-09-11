from datetime import datetime
from typing import Any
from uuid import UUID

from evm_project_tool.domain import Activity, Project


def row_to_project(row: dict[str, Any]) -> Project:
    return Project(
        id=row["id"],
        name=row["name"],
        description=row["description"],
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
    )


def row_to_activity(row: dict[str, Any]) -> Activity:
    return Activity.create(
        id=row["id"],
        projectId=row["project_id"],
        name=row["name"],
        budgetAtCompletion=row["budget_at_completion"],
        plannedProgressPercentage=row["planned_progress_percentage"],
        actualProgressPercentage=row["actual_progress_percentage"],
        actualCost=row["actual_cost"],
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
    )


def project_to_params(
    project: Project,
) -> tuple[UUID, str, str | None, datetime | None, datetime | None]:
    return (
        project.id,
        project.name,
        project.description,
        project.createdAt,
        project.updatedAt,
    )


def activity_to_params(
    activity: Activity,
) -> tuple[
    UUID,
    UUID,
    str,
    Any,
    Any,
    Any,
    Any,
    datetime | None,
    datetime | None,
]:
    return (
        activity.id,
        activity.projectId,
        activity.name,
        activity.budgetAtCompletion.value,
        activity.plannedProgressPercentage.value,
        activity.actualProgressPercentage.value,
        activity.actualCost.value,
        activity.createdAt,
        activity.updatedAt,
    )
