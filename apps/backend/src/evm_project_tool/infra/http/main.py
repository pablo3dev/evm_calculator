import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from evm_project_tool.application.exceptions import NotFoundError, ValidationError
from evm_project_tool.infra.http.routers import activities_router, projects_router
from evm_project_tool.infra.persistence.connection import close_pool, create_pool

logger = logging.getLogger(__name__)


def _configure_logging() -> None:
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(level=log_level)


def _parse_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    environment = os.getenv("ENVIRONMENT", "development").lower()
    if environment in {"production", "prod"} and "*" in origins:
        msg = "CORS wildcard '*' is not allowed in production"
        raise ValueError(msg)
    return origins


@asynccontextmanager
async def lifespan(app: FastAPI):
    database_url = os.environ["DATABASE_URL"]
    pool = create_pool(database_url)
    app.state.pool = pool
    try:
        yield
    finally:
        close_pool(pool)


def create_app() -> FastAPI:
    _configure_logging()

    app = FastAPI(
        title="EVM Project Tool API",
        version="1.0.0",
        description=(
            "API REST para gestión de proyectos/actividades y cálculo EVM en lectura."
        ),
        docs_url="/api-docs",
        redoc_url=None,
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    @app.get("/swagger-ui", include_in_schema=False)
    async def swagger_ui_redirect() -> RedirectResponse:
        return RedirectResponse(url="/api-docs", status_code=308)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_parse_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(ValidationError)
    async def application_validation_handler(_request, exc: ValidationError):
        logger.info("422 ValidationError: %s", exc.message)
        return JSONResponse(
            status_code=422,
            content={
                "detail": [
                    {
                        "loc": ["body"],
                        "msg": exc.message,
                        "type": "value_error",
                    }
                ]
            },
        )

    @app.exception_handler(NotFoundError)
    async def not_found_handler(_request, exc: NotFoundError):
        logger.info("404 NotFoundError: %s", exc.message)
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(RequestValidationError)
    async def request_validation_handler(request, exc: RequestValidationError):
        logger.info("422 RequestValidationError path=%s", request.url.path)
        return JSONResponse(
            status_code=422,
            content={"detail": jsonable_encoder(exc.errors())},
        )

    app.include_router(projects_router, prefix="/api/v1")
    app.include_router(activities_router, prefix="/api/v1")

    return app


app = create_app()
