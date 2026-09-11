from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from evm_project_tool.domain.exceptions import DomainValidationError


@dataclass
class Project:
    id: UUID
    name: str
    description: str | None = None
    createdAt: datetime | None = None
    updatedAt: datetime | None = None

    def __post_init__(self) -> None:
        if not self.name or not self.name.strip():
            raise DomainValidationError("Project name must not be empty")
