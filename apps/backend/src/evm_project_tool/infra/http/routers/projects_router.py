import logging
from uuid import UUID

from fastapi import APIRouter, Response, status

from evm_project_tool.application.use_cases import (
    create_project,
    delete_project,
    get_project,
    list_projects,
    update_project,
)
from evm_project_tool.infra.http.dependencies import ActivityRepoDep, ProjectRepoDep
from evm_project_tool.infra.http.schemas import (
    ProjectCreateRequest,
    ProjectDetailResponse,
    ProjectResponse,
    ProjectUpdateRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectResponse])
def list_projects_endpoint(
    project_repository: ProjectRepoDep,
) -> list[ProjectResponse]:
    projects = list_projects(project_repository)
    return [ProjectResponse.from_domain(project) for project in projects]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project_endpoint(
    body: ProjectCreateRequest,
    project_repository: ProjectRepoDep,
) -> ProjectResponse:
    project = create_project(
        name=body.name,
        description=body.description,
        project_repository=project_repository,
    )
    logger.info("Created project id=%s", project.id)
    return ProjectResponse.from_domain(project)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project_endpoint(
    project_id: UUID,
    project_repository: ProjectRepoDep,
    activity_repository: ActivityRepoDep,
) -> ProjectDetailResponse:
    detail = get_project(
        project_id=project_id,
        project_repository=project_repository,
        activity_repository=activity_repository,
    )
    return ProjectDetailResponse.from_domain(detail)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project_endpoint(
    project_id: UUID,
    body: ProjectUpdateRequest,
    project_repository: ProjectRepoDep,
) -> ProjectResponse:
    project = update_project(
        project_id=project_id,
        name=body.name,
        description=body.description,
        project_repository=project_repository,
    )
    logger.info("Updated project id=%s", project.id)
    return ProjectResponse.from_domain(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_endpoint(
    project_id: UUID,
    project_repository: ProjectRepoDep,
) -> Response:
    delete_project(project_id=project_id, project_repository=project_repository)
    logger.info("Deleted project id=%s", project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
