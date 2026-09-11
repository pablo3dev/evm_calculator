# port: in — persistence contract for Project aggregates
from typing import Protocol
from uuid import UUID

from evm_project_tool.domain import Project


class ProjectRepository(Protocol):
    def create(self, project: Project) -> Project: ...

    def get_by_id(self, project_id: UUID) -> Project | None: ...

    def list_all(self) -> list[Project]: ...

    def update(self, project: Project) -> Project: ...

    def delete(self, project_id: UUID) -> bool: ...
