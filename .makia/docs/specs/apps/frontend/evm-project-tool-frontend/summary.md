# evm-project-tool-frontend

> Dashboard React de presentación EVM para el líder de proyecto; consume la API REST del backend sin lógica de negocio propia.

## Estado

| Estado global | Última actualización |
|:---:|:---:|
| `En progreso` | `2026-09-11` |

## Objetivo

Ofrecer al líder de proyecto un dashboard web claro y accionable para visualizar el estado de sus proyectos y actividades mediante indicadores EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC). La interfaz se limita a presentación y captura de datos: toda la lógica de cálculo y persistencia reside en el backend, al que se accede exclusivamente vía contrato REST/OpenAPI.

## Avance

| Fase | Estado |
|:---|:---:|
| Fase 1: Scaffolding | `Completado` (2/2 tareas) |
| Fase 2: API client | `Completado` (2/2 tareas) |
| Fase 3: Dashboard componentes | `En progreso` (0/7 tareas) |
| Fase 4: Docker / verificación | `Pendiente` |

**Progreso global:** `~29%` (4 de 14 tareas)

**Tarea 2.2 completada:** módulos de dominio API en `src/api/projects.ts` y `src/api/activities.ts` — **10 métodos** 1:1 con el contrato backend §4.2 (`listProjects`, `createProject`, `getProject`, `updateProject`, `deleteProject`, `listActivitiesByProject`, `createActivity`, `getActivity`, `updateActivity`, `deleteActivity`); tipos de retorno alineados con `src/types/api.ts`; propagación de `ApiError` sin tragar códigos HTTP.

## Qué puede hacer ya el usuario / Qué falta

**Ya disponible:**
- Footprint Vite React-TS en `apps/frontend/` con dependencias fijadas (React 19, Vite 8, TypeScript 7, Recharts 3).
- Toolchain operativa: `npm run build`, `npm run lint` y `npm run format` pasan sin errores.
- Shell mínimo en `src/App.tsx` listo para integrar componentes del dashboard.
- Tipos TypeScript del contrato API en `src/types/api.ts` (snake_case, alineados con OpenAPI backend).
- Cliente HTTP base en `src/api/client.ts` (`ApiError`, `apiFetch`, helpers REST tipados).
- Módulos de dominio API completos: `src/api/projects.ts` (5 métodos) y `src/api/activities.ts` (5 métodos) — **10 métodos REST** listos para consumo por componentes del dashboard.

**Pendiente:**
- Componentes del dashboard (`ProjectSelector`, `ActivitiesTable`, `ConsolidatedIndicators`, `CpiSpiBadge`, `PvEvAcChart`, `ActivityFormModal`) e integración en `Dashboard.tsx`.
- Dockerfile, nginx y verificación manual contra backend local.

## Coordinación multi-unidad

Esta unidad (`apps/frontend/`) es la tercera de 4 unit-specs de la capacidad "EVM Project Tool", creadas en este orden fijo:

1. [`evm-project-tool-db`](../../db/evm-project-tool-db/summary.md) — esquema PostgreSQL y migraciones.
2. [`evm-project-tool-backend`](../../backend/evm-project-tool-backend/summary.md) — API REST y lógica de negocio EVM.
3. **`evm-project-tool-frontend`** (esta unidad) — dashboard de presentación EVM.
4. [`evm-project-tool-infrastructure`](../../infrastructure/evm-project-tool-infrastructure/summary.md) — orquestación Docker Compose. Pendiente de creación.

**Depende de:** unit-spec [`evm-project-tool-backend`](../../backend/evm-project-tool-backend/summary.md) (contrato REST: endpoints de proyectos, actividades e indicadores EVM).

**Modelo de dominio (referencia conceptual, no duplicar):** [`../../backend/domain-model.md`](../../backend/domain-model.md)

Condición de Done conjunto de la capacidad completa: las 4 unidades con todas sus tareas en `[x]`, TEST/AUDIT en verde por unidad, y la E2E cross-unidad (`docker compose up` completo levantando DB + migraciones + backend + frontend) pasando sin intervención manual.
