from uuid import uuid4

from evm_project_tool.application.ports import ProjectRepository
from evm_project_tool.application.use_cases._validation import validate_non_empty_name
from evm_project_tool.domain import Project


def create_project(
    name: str,
    project_repository: ProjectRepository,
    description: str | None = None,
) -> Project:
    validate_non_empty_name(name, entity="Project")
    project = Project(id=uuid4(), name=name, description=description)
    return project_repository.create(project)
