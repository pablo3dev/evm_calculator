from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from evm_project_tool.application.use_cases.get_activity import ActivityWithIndicators
from evm_project_tool.infra.http.schemas.evm_schemas import EvmIndicators


class ActivityCreateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1)
    budget_at_completion: Decimal = Field(ge=0)
    planned_progress_percentage: Decimal = Field(ge=0, le=100)
    actual_progress_percentage: Decimal = Field(ge=0, le=100)
    actual_cost: Decimal = Field(ge=0)


class ActivityUpdateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1)
    budget_at_completion: Decimal = Field(ge=0)
    planned_progress_percentage: Decimal = Field(ge=0, le=100)
    actual_progress_percentage: Decimal = Field(ge=0, le=100)
    actual_cost: Decimal = Field(ge=0)


class ActivityWithIndicatorsResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    project_id: UUID
    name: str
    budget_at_completion: float
    planned_progress_percentage: float
    actual_progress_percentage: float
    actual_cost: float
    created_at: datetime
    updated_at: datetime
    indicators: EvmIndicators

    @classmethod
    def from_domain(
        cls, item: ActivityWithIndicators
    ) -> ActivityWithIndicatorsResponse:
        activity = item.activity
        return cls(
            id=activity.id,
            project_id=activity.projectId,
            name=activity.name,
            budget_at_completion=float(activity.budgetAtCompletion.value),
            planned_progress_percentage=float(activity.plannedProgressPercentage.value),
            actual_progress_percentage=float(activity.actualProgressPercentage.value),
            actual_cost=float(activity.actualCost.value),
            created_at=activity.createdAt,  # type: ignore[arg-type]
            updated_at=activity.updatedAt,  # type: ignore[arg-type]
            indicators=EvmIndicators.from_domain(
                item.indicators,
                context=f"activity {activity.id}",
            ),
        )
