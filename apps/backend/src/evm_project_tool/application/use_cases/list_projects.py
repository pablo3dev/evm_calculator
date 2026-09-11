from evm_project_tool.application.ports import ProjectRepository
from evm_project_tool.domain import Project


def list_projects(project_repository: ProjectRepository) -> list[Project]:
    return project_repository.list_all()
