from dataclasses import dataclass
from uuid import UUID

from evm_project_tool.application.exceptions import NotFoundError
from evm_project_tool.application.ports import ActivityRepository, ProjectRepository
from evm_project_tool.domain import EvmCalculationService, EvmIndicatorSet, Project


@dataclass(frozen=True)
class ProjectDetail:
    project: Project
    consolidated_indicators: EvmIndicatorSet


def get_project(
    project_id: UUID,
    project_repository: ProjectRepository,
    activity_repository: ActivityRepository,
    evm_calculation_service: EvmCalculationService | None = None,
) -> ProjectDetail:
    project = project_repository.get_by_id(project_id)
    if project is None:
        raise NotFoundError(f"Project {project_id} not found")
    service = evm_calculation_service or EvmCalculationService()
    activities = activity_repository.list_by_project_id(project_id)
    consolidated_indicators = service.aggregate(activities)
    return ProjectDetail(
        project=project,
        consolidated_indicators=consolidated_indicators,
    )
