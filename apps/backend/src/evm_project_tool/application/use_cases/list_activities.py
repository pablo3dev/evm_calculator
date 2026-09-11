from uuid import UUID

from evm_project_tool.application.exceptions import NotFoundError
from evm_project_tool.application.ports import ActivityRepository
from evm_project_tool.application.use_cases.get_activity import ActivityWithIndicators
from evm_project_tool.domain import EvmCalculationService


def list_activities(
    project_id: UUID,
    activity_repository: ActivityRepository,
    evm_calculation_service: EvmCalculationService | None = None,
) -> list[ActivityWithIndicators]:
    if not activity_repository.exists_project(project_id):
        raise NotFoundError(f"Project {project_id} not found")
    service = evm_calculation_service or EvmCalculationService()
    activities = activity_repository.list_by_project_id(project_id)
    return [
        ActivityWithIndicators(
            activity=activity,
            indicators=service.calculate_for_activity(activity),
        )
        for activity in activities
    ]
