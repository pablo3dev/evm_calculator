from dataclasses import dataclass
from uuid import UUID

from evm_project_tool.domain.exceptions import DomainValidationError


@dataclass
class Project:
    id: UUID
    name: str
    description: str | None = None

    def __post_init__(self) -> None:
        if not self.name or not self.name.strip():
            raise DomainValidationError("Project name must not be empty")
