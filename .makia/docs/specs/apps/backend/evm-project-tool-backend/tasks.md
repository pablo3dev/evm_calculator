# Implementation Tasks: EVM Project Tool Backend

## 1. Metadata & Traceability
- **Spec:** `evm-project-tool-backend`
- **Requirements Ref:** `requirements.md` (spec: `evm-project-tool-backend`)
- **Design Ref:** `design.md` (spec: `evm-project-tool-backend`)

`[P]`: puede ejecutarse en paralelo (archivos distintos, sin dependencias entre sí dentro de la misma fase).

> **Nota footprint:** este spec **no** incluye tarea de `lefthook.yml` — la unit-spec db (`evm-project-tool-db`, Tarea 1.1) ya cubre verificación pre-commit de `apps/backend/` (ruff); documentado en `design.md` §2.5.

---

## 2. Execution Guidelines
- **Sequential Ordering:** ejecutar las fases en orden estricto (Fase 1 → 2 → 3 → 4); dentro de cada fase, respetar dependencias entre tareas (p. ej. 1.2 depende de 1.1; 3.3 depende de 3.2).
- **Test-Verified:** cada funcionalidad debe tener su prueba correspondiente antes de marcarse `[x]`.
- **Traceability Tags:** cada tarea referencia su origen en `requirements.md` (ej. `[REQ-01]`) y su componente en `design.md` (ej. `[DESIGN §3.1]`).
- **Dependencia externa:** requiere esquema PostgreSQL aplicado (`evm-project-tool-db` — tablas `projects` y `activities`) antes de Fase 3.2 y tests de integración Fase 4.

---

## 3. Phase Breakdown & Actionable Tasks

### Fase 1: Dominio EVM y entidades
- [x] **Tarea 1.1: Entidades de dominio** `[REQ-03]` `[REQ-04]` `[REQ-05]` `[DESIGN §3.1]` `[DESIGN §5]` — implementar en `apps/backend/src/evm_project_tool/domain/` las entidades y objetos de valor alineados con [`../../domain-model.md`](../../domain-model.md): `Project` (`project.py`), `Activity` con value objects embebidos (`activity.py` — `ProgressPercentage`, `MonetaryAmount`), y `EvmIndicatorSet` con campos PV/EV/CV/SV/CPI/SPI/EAC/VAC nullable y textos de interpretación CPI/SPI (`evm_indicator_set.py`). Sin dependencias de FastAPI, psycopg ni Pydantic. Atributos en camelCase interno; validaciones de invariantes RN-10/RN-11 en constructores o factories de dominio donde aplique antes de persistencia.
- [ ] **Tarea 1.2: `EvmCalculationService` y tests unitarios de dominio** `[REQ-03]` `[REQ-04]` `[REQ-05]` `[RN-01..RN-13]` `[EC-01..EC-09]` `[DESIGN §3.1]` `[DESIGN §8.1]` — implementar `evm_calculation_service.py` con `calculate_for_activity(activity) -> EvmIndicatorSet` (RN-01..RN-08, RN-09) y `aggregate(activities: list[Activity]) -> EvmIndicatorSet` (RN-12, RN-13). Crear `tests/unit/domain/test_evm_calculation_service.py` cubriendo EC-01..EC-09. Verificar cobertura ≥ 80 % sobre `domain/` antes de cerrar la tarea (`pytest-cov` acotado a `src/evm_project_tool/domain/`).

### Fase 2: Capa application
- [ ] **Tarea 2.1: [P] Puertos de entrada (repositorios)** `[REQ-01]` `[REQ-02]` `[DESIGN §4.1]` `[DESIGN §5]` — definir Protocols en `application/ports/in/project_repository.py` (`create`, `get_by_id`, `list_all`, `update`, `delete`) y `activity_repository.py` (`create`, `get_by_id`, `list_by_project_id`, `update`, `delete`, `exists_project`). Sin implementación concreta; solo contratos tipados hacia persistencia.
- [ ] **Tarea 2.2: Casos de uso CRUD de proyectos y actividades** `[REQ-01]` `[REQ-02]` `[DESIGN §4.1]` `[DESIGN §5]` — implementar use cases: `create_project`, `list_projects`, `update_project`, `delete_project`, `create_activity`, `update_activity`, `delete_activity`. Validar `name` no vacío (422 vía excepción de aplicación traducible en infra); propagar 404 cuando recurso inexistente; en `create_activity` verificar `exists_project` → 404 si `project_id` no existe (EC-07). Tests unitarios con mocks de repositorios en `tests/unit/application/test_use_cases.py` (orquestación CRUD, sin cálculo EVM aún).
- [ ] **Tarea 2.3: Casos de uso de consulta con indicadores** `[REQ-03]` `[REQ-04]` `[REQ-05]` `[DESIGN §4.1]` `[DESIGN §4.2]` — implementar `get_project` (detalle + `consolidated_indicators` vía `EvmCalculationService.aggregate`, RN-12/RN-13), `list_activities` (cada fila con indicadores por actividad), `get_activity` (detalle con indicadores). Indicadores calculados en lectura, nunca persistidos. Extender tests unitarios de application verificando invocación de dominio e inclusión de interpretaciones CPI/SPI (REQ-04).

### Fase 3: Infraestructura HTTP y persistencia
- [ ] **Tarea 3.1: Proyecto base (`pyproject.toml`, uv, Dockerfile, `.gitignore`)** `[REQ-07]` `[DESIGN §5]` `[DESIGN §2.5]` — crear footprint `apps/backend/` según mapa §5: `pyproject.toml` con uv, dependencias fijadas (`fastapi==0.141.1`, Pydantic v2, `psycopg[pool]==3.2.10`, `ruff==0.16.3`, pytest/pytest-cov para dev), `Dockerfile` multi-stage (ghcr.io/astral-sh/uv:python3.14-trixie-slim → python:3.14-slim-trixie), `.gitignore` (`.venv`, `__pycache__`, `.pytest_cache`, `.coverage`, etc.). **No** crear `lefthook.yml` (§2.5).
- [ ] **Tarea 3.2: [P] Repositorios PostgreSQL (psycopg3 ConnectionPool, SQL `%s`)** `[REQ-01]` `[REQ-02]` `[DESIGN §3.2]` `[DESIGN §3.3]` `[DESIGN §5]` `[DESIGN §7.2]` — implementar `infra/persistence/connection.py` (`psycopg_pool.ConnectionPool` con `DATABASE_URL`), `mappers.py` (snake_case DB ↔ camelCase dominio), `postgres_project_repository.py` y `postgres_activity_repository.py` con SQL parametrizado exclusivamente `%s` (prohibido concatenar input). Mapear columnas de `design.md` §3.2; en UPDATE actualizar `updated_at` explícitamente desde aplicación (db spec no define trigger). Traducir errores FK/CHECK de PostgreSQL a excepciones de aplicación cuando corresponda.
- [ ] **Tarea 3.3: Routers FastAPI `/api/v1`, schemas Pydantic v2, `main.py`, CORS env** `[REQ-01]` `[REQ-02]` `[REQ-03]` `[REQ-04]` `[REQ-05]` `[REQ-07]` `[DESIGN §4.2]` `[DESIGN §5]` `[DESIGN §7.1]` — implementar `infra/http/main.py` (lifespan pool, CORS desde `CORS_ORIGINS` sin wildcard en prod), `dependencies.py`, routers `projects_router.py` y `activities_router.py` bajo prefijo `/api/v1`, schemas Pydantic v2 en snake_case JSON (`project_schemas.py`, `activity_schemas.py`, `evm_schemas.py`). Contrato según OpenAPI §4.2 (10 endpoints, códigos 200/201/204/404/422). Logging INFO en mutaciones y 404/422; WARNING en indicadores `null` por RN-09.
- [ ] **Tarea 3.4: Swagger UI `/api-docs`** `[REQ-07]` `[DESIGN §4.2]` `[DESIGN §5]` — configurar documentación interactiva en `/api-docs` (redirect opcional `/swagger-ui` → `/api-docs`), tags `Projects`/`Activities`, descripciones, schemas request/response y respuestas de error documentadas. Verificar acceso local a `/openapi.json`.

### Fase 4: Tests integración y verificación
- [ ] **Tarea 4.1: Tests de integración (≥ 1 por endpoint REST)** `[REQ-01]` `[REQ-02]` `[REQ-03]` `[REQ-04]` `[REQ-05]` `[DESIGN §8.2]` — crear `tests/integration/conftest.py` (PostgreSQL real o testcontainer; aplicar migraciones de `apps/db/`), `test_projects_api.py` y `test_activities_api.py`. Mínimo 1 test happy path por cada uno de los 10 endpoints §4.2; incluir casos 404 (EC-07, delete inexistente) y 422 (EC-08, EC-09, name vacío) donde aplique. Validar presencia de indicadores e interpretaciones en respuestas de lectura.
- [ ] **Tarea 4.2: Verificación de cobertura y linter** `[REQ-03]` `[DESIGN §8.1]` `[DESIGN §5]` — ejecutar suite completa: cobertura ≥ 80 % en `domain/` + `application/` (`pytest-cov`); `ruff check` y `ruff format --check` sobre `apps/backend/` sin errores (verificación también cubierta por `lefthook.yml` de db spec en pre-commit). Documentar comandos en comentario mínimo de `pyproject.toml` o script `[tool.uv]` si aplica; no crear README propio salvo que IMPLEMENT lo requiera transversalmente.

---

## 4. Execution Progress Tracker
| Fase | Total Tareas | Completadas | Estado |
|:---|:---:|:---:|:---|
| Fase 1: Dominio EVM y entidades | 2 | 1 | `In Progress` |
| Fase 2: Capa application | 3 | 0 | `Pending` |
| Fase 3: Infraestructura HTTP y persistencia | 4 | 0 | `Pending` |
| Fase 4: Tests integración y verificación | 2 | 0 | `Pending` |
| **Total Global** | **11** | **1** | **9%** |

---

## 5. Definition of Done (DoD) Gate
- [ ] Todas las tareas están marcadas como completadas (`[x]`).
- [ ] Todos los criterios EARS de `requirements.md` (REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-07) pasan las pruebas asociadas.
- [ ] Reglas RN-01..RN-13 verificadas; edge cases EC-01..EC-09 cubiertos en tests unitarios de dominio.
- [ ] La estructura de archivos coincide con el mapeo de `design.md` §5 (footprint exclusivo `apps/backend/`).
- [ ] Cobertura ≥ 80 % en `domain/` + `application/`; ≥ 1 test de integración por endpoint REST.
- [ ] `ruff check` y `ruff format --check` limpios sobre `apps/backend/`.
- [ ] Swagger UI accesible en `/api-docs` con contrato §4.2.
- [ ] La fila del spec en el `INDEX.md` de specs (`.makia/docs/specs/<categoría>/INDEX.md`) está sincronizada con el `Estado global` de `summary.md`.

---

> IMPLEMENT ejecuta este documento tarea por tarea. Cada tarea se valida con un TEST acotado a sus propios archivos (no la suite completa) antes de marcarse `[x]`. Máximo 2 iteraciones de corrección por tarea antes de cancelar y escalar (ver sub-orchestrator.md del Orquestador).
