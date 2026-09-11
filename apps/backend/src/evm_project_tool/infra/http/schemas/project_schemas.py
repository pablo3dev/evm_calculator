from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from evm_project_tool.application.use_cases.get_project import ProjectDetail
from evm_project_tool.domain import Project
from evm_project_tool.infra.http.schemas.evm_schemas import EvmIndicators


class ProjectCreateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1)
    description: str | None = None


class ProjectUpdateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1)
    description: str | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_domain(cls, project: Project) -> ProjectResponse:
        return cls(
            id=project.id,
            name=project.name,
            description=project.description,
            created_at=project.createdAt,  # type: ignore[arg-type]
            updated_at=project.updatedAt,  # type: ignore[arg-type]
        )


class ProjectDetailResponse(ProjectResponse):
    consolidated_indicators: EvmIndicators

    @classmethod
    def from_domain(cls, detail: ProjectDetail) -> ProjectDetailResponse:
        base = ProjectResponse.from_domain(detail.project)
        return cls(
            **base.model_dump(),
            consolidated_indicators=EvmIndicators.from_domain(
                detail.consolidated_indicators,
                context=f"project {detail.project.id}",
            ),
        )
