from typing import Annotated

from fastapi import Depends, Request
from psycopg_pool import ConnectionPool

from evm_project_tool.domain import EvmCalculationService
from evm_project_tool.infra.persistence.postgres_activity_repository import (
    PostgresActivityRepository,
)
from evm_project_tool.infra.persistence.postgres_project_repository import (
    PostgresProjectRepository,
)


def get_pool(request: Request) -> ConnectionPool:
    return request.app.state.pool


PoolDep = Annotated[ConnectionPool, Depends(get_pool)]


def get_project_repository(pool: PoolDep) -> PostgresProjectRepository:
    return PostgresProjectRepository(pool)


def get_activity_repository(pool: PoolDep) -> PostgresActivityRepository:
    return PostgresActivityRepository(pool)


def get_evm_calculation_service() -> EvmCalculationService:
    return EvmCalculationService()


ProjectRepoDep = Annotated[PostgresProjectRepository, Depends(get_project_repository)]
ActivityRepoDep = Annotated[
    PostgresActivityRepository, Depends(get_activity_repository)
]
EvmServiceDep = Annotated[EvmCalculationService, Depends(get_evm_calculation_service)]
