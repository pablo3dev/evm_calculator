from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from evm_project_tool.domain.exceptions import DomainValidationError


@dataclass(frozen=True)
class ProgressPercentage:
    value: Decimal

    def __post_init__(self) -> None:
        if not (Decimal("0") <= self.value <= Decimal("100")):
            raise DomainValidationError(
                "Progress percentage must be between 0 and 100 inclusive"
            )


@dataclass(frozen=True)
class MonetaryAmount:
    value: Decimal

    def __post_init__(self) -> None:
        if self.value < Decimal("0"):
            raise DomainValidationError("Monetary amount must be greater than or equal to 0")


@dataclass
class Activity:
    id: UUID
    projectId: UUID
    name: str
    budgetAtCompletion: MonetaryAmount
    plannedProgressPercentage: ProgressPercentage
    actualProgressPercentage: ProgressPercentage
    actualCost: MonetaryAmount
    createdAt: datetime | None = None
    updatedAt: datetime | None = None

    def __post_init__(self) -> None:
        if not self.name or not self.name.strip():
            raise DomainValidationError("Activity name must not be empty")

    @classmethod
    def create(
        cls,
        id: UUID,
        projectId: UUID,
        name: str,
        budgetAtCompletion: Decimal,
        plannedProgressPercentage: Decimal,
        actualProgressPercentage: Decimal,
        actualCost: Decimal,
        createdAt: datetime | None = None,
        updatedAt: datetime | None = None,
    ) -> "Activity":
        return cls(
            id=id,
            projectId=projectId,
            name=name,
            budgetAtCompletion=MonetaryAmount(budgetAtCompletion),
            plannedProgressPercentage=ProgressPercentage(plannedProgressPercentage),
            actualProgressPercentage=ProgressPercentage(actualProgressPercentage),
            actualCost=MonetaryAmount(actualCost),
            createdAt=createdAt,
            updatedAt=updatedAt,
        )
