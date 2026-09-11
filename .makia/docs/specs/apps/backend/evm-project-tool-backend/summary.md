# evm-project-tool-backend

> API REST FastAPI con toda la lógica de negocio EVM (CRUD proyectos/actividades, cálculo indicadores, OpenAPI).

## Estado

| Estado global | Última actualización |
|:---:|:---:|
| `En progreso` | `2026-09-11` |

## Objetivo

Ofrecer al líder de proyecto una API REST confiable que centralice la gestión de proyectos y actividades y el cálculo de indicadores EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC) según las reglas de negocio del dominio. El backend consolida la lógica que hoy se fragmentaría entre capas, garantizando indicadores correctos y consistentes en cada consulta, sin persistir valores calculados.

## Avance

| Fase | Estado |
|:---|:---:|
| Fase 1: Dominio EVM | `Completado` |
| Fase 2: Application / ports | `Completado` |
| Fase 3: Infra HTTP + SQL | `Completado` |
| Fase 4: Tests integración + Swagger | `Completado` |

**Progreso global:** `100%` (11 de 11 tareas IMPLEMENT completadas)

**Tarea 1.1 completada:** entidades de dominio implementadas en `apps/backend/src/evm_project_tool/domain/` — `Project`, `Activity` (con value objects `ProgressPercentage` y `MonetaryAmount`), y `EvmIndicatorSet`.

**Tarea 1.2 completada:** `EvmCalculationService` con tests unitarios EC-01..EC-06; cobertura de `domain/` ≥ 96 %.

**Fase 2 completada:** Tarea 2.1 (puertos de entrada en `application/ports/in/`), Tarea 2.2 (casos de uso CRUD de proyectos y actividades con tests unitarios) y Tarea 2.3 (casos de uso de consulta con indicadores EVM: `get_project`, `list_activities`, `get_activity` — indicadores calculados en lectura vía `EvmCalculationService`, nunca persistidos).

**Fase 3 completada:** Tarea 3.1 (footprint `pyproject.toml`, uv, Dockerfile, `.gitignore`), Tarea 3.2 (repositorios PostgreSQL con psycopg3 ConnectionPool y SQL `%s`), Tarea 3.3 (routers FastAPI `/api/v1`, schemas Pydantic v2, `main.py`, CORS) y Tarea 3.4 (Swagger UI en `/api-docs` con contrato OpenAPI §4.2).

**Fase 4 completada:** Tarea 4.1 (tests de integración — ≥ 1 por endpoint REST, casos 404/422, indicadores e interpretaciones en lectura) y Tarea 4.2 (cobertura ≥ 80 % en `domain/` + `application/`, `ruff check` y `ruff format --check` limpios).

**Nota técnica:** el paquete `ports/in/` usa `importlib` como workaround porque `in` es palabra reservada de Python y no puede importarse con la sintaxis estándar.

## Qué puede hacer ya el usuario / Qué falta

**Disponible ahora:** API REST CRUD de proyectos y actividades bajo `/api/v1`; consultas de lectura con indicadores EVM calculados en tiempo real (PV, EV, CV, SV, CPI, SPI, EAC, VAC) e interpretaciones CPI/SPI; documentación interactiva Swagger en `/api-docs` (OpenAPI en `/openapi.json`).

**Pendiente de cierre:** validación TEST global y AUDIT por el Orquestador antes de marcar el spec como `Completado`.

## Coordinación multi-unidad

Esta unidad (`apps/backend/`) es la segunda de 4 unit-specs de la capacidad "EVM Project Tool", creadas en este orden fijo:

1. [`evm-project-tool-db`](../../db/evm-project-tool-db/summary.md) — esquema PostgreSQL y migraciones. **Creado** (Creación Aprobado).
2. **`evm-project-tool-backend`** (esta unidad) — API REST y lógica de negocio EVM.
3. [`evm-project-tool-frontend`](../../frontend/evm-project-tool-frontend/summary.md) — dashboard de presentación. Pendiente de creación.
4. [`evm-project-tool-infrastructure`](../../infrastructure/evm-project-tool-infrastructure/summary.md) — orquestación Docker Compose. Pendiente de creación.

**Depende de:** unit-spec [`evm-project-tool-db`](../../db/evm-project-tool-db/summary.md) (esquema PostgreSQL: tablas `projects` y `activities`, migraciones aplicables).

Condición de Done conjunto de la capacidad completa: las 4 unidades con todas sus tareas en `[x]`, TEST/AUDIT en verde por unidad, y la E2E cross-unidad (`docker compose up` completo levantando DB + migraciones + backend + frontend) pasando sin intervención manual.
