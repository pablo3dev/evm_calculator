from dataclasses import dataclass
from uuid import UUID

from evm_project_tool.application.exceptions import NotFoundError
from evm_project_tool.application.ports import ActivityRepository
from evm_project_tool.domain import Activity, EvmCalculationService, EvmIndicatorSet


@dataclass(frozen=True)
class ActivityWithIndicators:
    activity: Activity
    indicators: EvmIndicatorSet


def get_activity(
    activity_id: UUID,
    activity_repository: ActivityRepository,
    evm_calculation_service: EvmCalculationService | None = None,
) -> ActivityWithIndicators:
    activity = activity_repository.get_by_id(activity_id)
    if activity is None:
        raise NotFoundError(f"Activity {activity_id} not found")
    service = evm_calculation_service or EvmCalculationService()
    indicators = service.calculate_for_activity(activity)
    return ActivityWithIndicators(activity=activity, indicators=indicators)
