from decimal import Decimal
from uuid import UUID

from evm_project_tool.application.exceptions import NotFoundError, ValidationError
from evm_project_tool.application.ports import ActivityRepository
from evm_project_tool.domain import Activity, DomainValidationError


def update_activity(
    activity_id: UUID,
    name: str,
    bac: Decimal,
    planned_pct: Decimal,
    actual_pct: Decimal,
    ac: Decimal,
    activity_repository: ActivityRepository,
) -> Activity:
    existing = activity_repository.get_by_id(activity_id)
    if existing is None:
        raise NotFoundError(f"Activity {activity_id} not found")
    try:
        activity = Activity.create(
            id=activity_id,
            projectId=existing.projectId,
            name=name,
            budgetAtCompletion=bac,
            plannedProgressPercentage=planned_pct,
            actualProgressPercentage=actual_pct,
            actualCost=ac,
            createdAt=existing.createdAt,
            updatedAt=existing.updatedAt,
        )
    except DomainValidationError as exc:
        raise ValidationError(str(exc)) from exc
    return activity_repository.update(activity)
