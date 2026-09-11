# evm-project-tool-db

> Esquema PostgreSQL y migraciones que persisten los proyectos y actividades de la herramienta de seguimiento EVM.

## Estado

| Estado global | Última actualización |
|:---:|:---:|
| `En progreso` | `2026-09-11` |

## Objetivo

Persistir de forma confiable los datos de entrada de proyectos y actividades que alimentan el cálculo de indicadores de Valor Ganado (EVM), para que el backend pueda leer y escribir esa información con integridad referencial garantizada, sin necesidad de resolver reglas de negocio en esta capa.

## Avance

| Fase | Estado |
|:---|:---:|
| Fase 1: Configuración de verificación local (lefthook) | `Completada` |
| Fase 2: Esquema y migraciones de `projects` | `Completada` |
| Fase 3: Esquema y migraciones de `activities` | `Completada` |
| Fase 4: Verificación de integridad referencial y documentación | `Pendiente` |

**Progreso global:** `75%` (3 de 4 fases completadas)

## Qué puede hacer ya el usuario / Qué falta

- [x] Persistir un proyecto (`projects`) vía migración SQL aplicable con `yoyo apply`.
- [x] Persistir actividades (`activities`) de un proyecto con integridad referencial (FK con `delete: cascade`) e índice en `project_id`.
- [x] `lefthook.yml` en la raíz del repositorio con verificación local de backend y frontend.

## Coordinación multi-unidad

Esta unidad (`apps/db/`) es la primera de 4 unit-specs de la capacidad "EVM Project Tool", creadas en este orden fijo:

1. `evm-project-tool-db` (esta unidad) — esquema PostgreSQL y migraciones.
2. `evm-project-tool-backend` — API REST y lógica de negocio EVM. Depende de esta unidad.
3. `evm-project-tool-frontend` — dashboard de presentación. Depende de `evm-project-tool-backend`.
4. `evm-project-tool-infrastructure` — orquestación Docker Compose de las 3 unidades anteriores.

Como `evm-project-tool-db` es el primer unit-spec creado, todavía no existen `summary.md` de las unidades hermanas para enlazar por ruta relativa. SPEC completa estos enlaces en cada invocación siguiente, a medida que cada unit-spec hermano se cree:

- `evm-project-tool-backend`: `../../backend/evm-project-tool-backend/summary.md` (pendiente de creación).
- `evm-project-tool-frontend`: `../../frontend/evm-project-tool-frontend/summary.md` (pendiente de creación).
- `evm-project-tool-infrastructure`: `../../infrastructure/evm-project-tool-infrastructure/summary.md` (pendiente de creación).

Condición de Done conjunto de la capacidad completa: las 4 unidades con todas sus tareas en `[x]`, TEST/AUDIT en verde por unidad, y la E2E cross-unidad (`docker compose up` completo levantando DB + migraciones + backend + frontend) pasando sin intervención manual.
