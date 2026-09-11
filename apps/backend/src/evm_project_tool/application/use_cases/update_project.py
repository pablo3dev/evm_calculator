from uuid import UUID

from evm_project_tool.application.exceptions import NotFoundError
from evm_project_tool.application.ports import ProjectRepository
from evm_project_tool.application.use_cases._validation import validate_non_empty_name
from evm_project_tool.domain import Project


def update_project(
    project_id: UUID,
    name: str,
    description: str | None,
    project_repository: ProjectRepository,
) -> Project:
    validate_non_empty_name(name, entity="Project")
    if project_repository.get_by_id(project_id) is None:
        raise NotFoundError(f"Project {project_id} not found")
    project = Project(id=project_id, name=name, description=description)
    return project_repository.update(project)
