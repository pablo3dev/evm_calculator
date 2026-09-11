import logging
from uuid import UUID

from fastapi import APIRouter, Response, status

from evm_project_tool.application.use_cases import (
    create_activity,
    delete_activity,
    get_activity,
    list_activities,
    update_activity,
)
from evm_project_tool.infra.http.dependencies import ActivityRepoDep, EvmServiceDep
from evm_project_tool.infra.http.schemas import (
    ActivityCreateRequest,
    ActivityUpdateRequest,
    ActivityWithIndicatorsResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Activities"])


@router.get(
    "/projects/{project_id}/activities",
    response_model=list[ActivityWithIndicatorsResponse],
)
def list_activities_endpoint(
    project_id: UUID,
    activity_repository: ActivityRepoDep,
    evm_calculation_service: EvmServiceDep,
) -> list[ActivityWithIndicatorsResponse]:
    items = list_activities(
        project_id=project_id,
        activity_repository=activity_repository,
        evm_calculation_service=evm_calculation_service,
    )
    return [ActivityWithIndicatorsResponse.from_domain(item) for item in items]


@router.post(
    "/projects/{project_id}/activities",
    response_model=ActivityWithIndicatorsResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_activity_endpoint(
    project_id: UUID,
    body: ActivityCreateRequest,
    activity_repository: ActivityRepoDep,
    evm_calculation_service: EvmServiceDep,
) -> ActivityWithIndicatorsResponse:
    activity = create_activity(
        project_id=project_id,
        name=body.name,
        bac=body.budget_at_completion,
        planned_pct=body.planned_progress_percentage,
        actual_pct=body.actual_progress_percentage,
        ac=body.actual_cost,
        activity_repository=activity_repository,
    )
    logger.info("Created activity id=%s project_id=%s", activity.id, project_id)
    result = get_activity(
        activity_id=activity.id,
        activity_repository=activity_repository,
        evm_calculation_service=evm_calculation_service,
    )
    return ActivityWithIndicatorsResponse.from_domain(result)


@router.get(
    "/activities/{activity_id}",
    response_model=ActivityWithIndicatorsResponse,
)
def get_activity_endpoint(
    activity_id: UUID,
    activity_repository: ActivityRepoDep,
    evm_calculation_service: EvmServiceDep,
) -> ActivityWithIndicatorsResponse:
    result = get_activity(
        activity_id=activity_id,
        activity_repository=activity_repository,
        evm_calculation_service=evm_calculation_service,
    )
    return ActivityWithIndicatorsResponse.from_domain(result)


@router.put(
    "/activities/{activity_id}",
    response_model=ActivityWithIndicatorsResponse,
)
def update_activity_endpoint(
    activity_id: UUID,
    body: ActivityUpdateRequest,
    activity_repository: ActivityRepoDep,
    evm_calculation_service: EvmServiceDep,
) -> ActivityWithIndicatorsResponse:
    activity = update_activity(
        activity_id=activity_id,
        name=body.name,
        bac=body.budget_at_completion,
        planned_pct=body.planned_progress_percentage,
        actual_pct=body.actual_progress_percentage,
        ac=body.actual_cost,
        activity_repository=activity_repository,
    )
    logger.info("Updated activity id=%s project_id=%s", activity.id, activity.projectId)
    result = get_activity(
        activity_id=activity.id,
        activity_repository=activity_repository,
        evm_calculation_service=evm_calculation_service,
    )
    return ActivityWithIndicatorsResponse.from_domain(result)


@router.delete(
    "/activities/{activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_activity_endpoint(
    activity_id: UUID,
    activity_repository: ActivityRepoDep,
) -> Response:
    delete_activity(activity_id=activity_id, activity_repository=activity_repository)
    logger.info("Deleted activity id=%s", activity_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
