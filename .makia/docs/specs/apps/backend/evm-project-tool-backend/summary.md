# evm-project-tool-backend

> API REST FastAPI con toda la lógica de negocio EVM (CRUD proyectos/actividades, cálculo indicadores, OpenAPI).

## Estado

| Estado global | Última actualización |
|:---:|:---:|
| `Pendiente` | `2026-09-11` |

## Objetivo

Ofrecer al líder de proyecto una API REST confiable que centralice la gestión de proyectos y actividades y el cálculo de indicadores EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC) según las reglas de negocio del dominio. El backend consolida la lógica que hoy se fragmentaría entre capas, garantizando indicadores correctos y consistentes en cada consulta, sin persistir valores calculados.

## Avance

| Fase | Estado |
|:---|:---:|
| Fase 1: Dominio EVM | `Pendiente` |
| Fase 2: Application / ports | `Pendiente` |
| Fase 3: Infra HTTP + SQL | `Pendiente` |
| Fase 4: Tests integración + Swagger | `Pendiente` |

**Progreso global:** `0%` (0 de 4 fases completadas)

## Qué puede hacer ya el usuario / Qué falta

_Pendiente — se completará al avanzar `tasks.md` e IMPLEMENT._

## Coordinación multi-unidad

Esta unidad (`apps/backend/`) es la segunda de 4 unit-specs de la capacidad "EVM Project Tool", creadas en este orden fijo:

1. [`evm-project-tool-db`](../../db/evm-project-tool-db/summary.md) — esquema PostgreSQL y migraciones. **Creado** (Creación Aprobado).
2. **`evm-project-tool-backend`** (esta unidad) — API REST y lógica de negocio EVM.
3. [`evm-project-tool-frontend`](../../frontend/evm-project-tool-frontend/summary.md) — dashboard de presentación. **Creado** (Creación pendiente aprobación).
4. [`evm-project-tool-infrastructure`](../../infrastructure/evm-project-tool-infrastructure/summary.md) — orquestación Docker Compose. Pendiente de creación.

**Depende de:** unit-spec [`evm-project-tool-db`](../../db/evm-project-tool-db/summary.md) (esquema PostgreSQL: tablas `projects` y `activities`, migraciones aplicables).

Condición de Done conjunto de la capacidad completa: las 4 unidades con todas sus tareas en `[x]`, TEST/AUDIT en verde por unidad, y la E2E cross-unidad (`docker compose up` completo levantando DB + migraciones + backend + frontend) pasando sin intervención manual.
