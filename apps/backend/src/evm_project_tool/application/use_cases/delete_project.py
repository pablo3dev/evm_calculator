from uuid import UUID

from evm_project_tool.application.exceptions import NotFoundError
from evm_project_tool.application.ports import ProjectRepository


def delete_project(project_id: UUID, project_repository: ProjectRepository) -> None:
    if not project_repository.delete(project_id):
        raise NotFoundError(f"Project {project_id} not found")
