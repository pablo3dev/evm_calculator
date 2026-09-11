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
| Fase 2: Application / ports | `En progreso` |
| Fase 3: Infra HTTP + SQL | `Pendiente` |
| Fase 4: Tests integración + Swagger | `Pendiente` |

**Progreso global:** `~36%` (4 de 11 tareas completadas)

**Tarea 1.1 completada:** entidades de dominio implementadas en `apps/backend/src/evm_project_tool/domain/` — `Project`, `Activity` (con value objects `ProgressPercentage` y `MonetaryAmount`), y `EvmIndicatorSet`.

**Tarea 1.2 completada:** `EvmCalculationService` con tests unitarios EC-01..EC-06; cobertura de `domain/` ≥ 96 %.

**Fase 2 en progreso:** Tarea 2.1 (puertos de entrada en `application/ports/in/`) y Tarea 2.2 (casos de uso CRUD de proyectos y actividades con tests unitarios) completadas. Pendiente Tarea 2.3 (consultas con indicadores EVM).

**Nota técnica:** el paquete `ports/in/` usa `importlib` como workaround porque `in` es palabra reservada de Python y no puede importarse con la sintaxis estándar.

## Qué puede hacer ya el usuario / Qué falta

_Pendiente — se completará al avanzar `tasks.md` e IMPLEMENT._

## Coordinación multi-unidad

Esta unidad (`apps/backend/`) es la segunda de 4 unit-specs de la capacidad "EVM Project Tool", creadas en este orden fijo:

1. [`evm-project-tool-db`](../../db/evm-project-tool-db/summary.md) — esquema PostgreSQL y migraciones. **Creado** (Creación Aprobado).
2. **`evm-project-tool-backend`** (esta unidad) — API REST y lógica de negocio EVM.
3. [`evm-project-tool-frontend`](../../frontend/evm-project-tool-frontend/summary.md) — dashboard de presentación. Pendiente de creación.
4. [`evm-project-tool-infrastructure`](../../infrastructure/evm-project-tool-infrastructure/summary.md) — orquestación Docker Compose. Pendiente de creación.

**Depende de:** unit-spec [`evm-project-tool-db`](../../db/evm-project-tool-db/summary.md) (esquema PostgreSQL: tablas `projects` y `activities`, migraciones aplicables).

Condición de Done conjunto de la capacidad completa: las 4 unidades con todas sus tareas en `[x]`, TEST/AUDIT en verde por unidad, y la E2E cross-unidad (`docker compose up` completo levantando DB + migraciones + backend + frontend) pasando sin intervención manual.
