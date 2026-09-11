from decimal import Decimal
from uuid import UUID, uuid4

from evm_project_tool.application.exceptions import NotFoundError, ValidationError
from evm_project_tool.application.ports import ActivityRepository
from evm_project_tool.domain import Activity, DomainValidationError


def create_activity(
    project_id: UUID,
    name: str,
    bac: Decimal,
    planned_pct: Decimal,
    actual_pct: Decimal,
    ac: Decimal,
    activity_repository: ActivityRepository,
) -> Activity:
    if not activity_repository.exists_project(project_id):
        raise NotFoundError(f"Project {project_id} not found")
    try:
        activity = Activity.create(
            id=uuid4(),
            projectId=project_id,
            name=name,
            budgetAtCompletion=bac,
            plannedProgressPercentage=planned_pct,
            actualProgressPercentage=actual_pct,
            actualCost=ac,
        )
    except DomainValidationError as exc:
        raise ValidationError(str(exc)) from exc
    return activity_repository.create(activity)
