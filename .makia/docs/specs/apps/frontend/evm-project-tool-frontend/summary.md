# evm-project-tool-frontend

> Dashboard React de presentación EVM para el líder de proyecto; consume la API REST del backend sin lógica de negocio propia.

## Estado

| Estado global | Última actualización |
|:---:|:---:|
| `Pendiente` | `2026-09-11` |

## Objetivo

Ofrecer al líder de proyecto un dashboard web claro y accionable para visualizar el estado de sus proyectos y actividades mediante indicadores EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC). La interfaz se limita a presentación y captura de datos: toda la lógica de cálculo y persistencia reside en el backend, al que se accede exclusivamente vía contrato REST/OpenAPI.

## Avance

| Fase | Estado |
|:---|:---:|
| Fase 1: Scaffolding | `Pendiente` |
| Fase 2: API client | `Pendiente` |
| Fase 3: Dashboard componentes | `Pendiente` |
| Fase 4: Docker / verificación | `Pendiente` |

**Progreso global:** `0%` (0 de 4 fases completadas)

## Qué puede hacer ya el usuario / Qué falta

_Pendiente — se completará al avanzar `tasks.md` e IMPLEMENT._

## Coordinación multi-unidad

Esta unidad (`apps/frontend/`) es la tercera de 4 unit-specs de la capacidad "EVM Project Tool", creadas en este orden fijo:

1. [`evm-project-tool-db`](../../db/evm-project-tool-db/summary.md) — esquema PostgreSQL y migraciones.
2. [`evm-project-tool-backend`](../../backend/evm-project-tool-backend/summary.md) — API REST y lógica de negocio EVM.
3. **`evm-project-tool-frontend`** (esta unidad) — dashboard de presentación EVM.
4. [`evm-project-tool-infrastructure`](../../infrastructure/evm-project-tool-infrastructure/summary.md) — orquestación Docker Compose. **Creado — pendiente aprobación**.

**Depende de:** unit-spec [`evm-project-tool-backend`](../../backend/evm-project-tool-backend/summary.md) (contrato REST: endpoints de proyectos, actividades e indicadores EVM).

**Modelo de dominio (referencia conceptual, no duplicar):** [`../../backend/domain-model.md`](../../backend/domain-model.md)

Condición de Done conjunto de la capacidad completa: las 4 unidades con todas sus tareas en `[x]`, TEST/AUDIT en verde por unidad, y la E2E cross-unidad (`docker compose up` completo levantando DB + migraciones + backend + frontend) pasando sin intervención manual.
