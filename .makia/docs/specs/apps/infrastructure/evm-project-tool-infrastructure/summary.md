# evm-project-tool-infrastructure

> Orquestación Docker Compose V2 que levanta PostgreSQL 18, migraciones yoyo, backend FastAPI y frontend nginx con un solo comando, sin lógica de negocio.

## Estado

| Estado global | Última actualización |
| :--- | :--- |
| `En progreso` | `2026-09-11` |

## Objetivo

Proveer el punto de entrada local único del monorepo EVM Project Tool: un `docker compose up` desde `apps/infrastructure/` que levante la base de datos, aplique migraciones con `yoyo apply --batch`, arranque la API REST y sirva el dashboard React, con orden de arranque garantizado vía healthchecks y `depends_on`, tanto en el primer arranque como en arranques posteriores, sin scripts manuales adicionales ni lógica de dominio en esta capa.

## Avance

| Fase | Estado |
| :--- | :--- |
| Fase 1: Configuración de `compose.yaml` y variables de entorno (`.env.example`) | `Completada` |
| Fase 2: Servicio `migrate` (contenedor one-shot con `yoyo apply --batch`) | `Completada` |
| Fase 3: Wiring de servicios (`db` → `migrate` → `backend` → `frontend`, puertos y healthchecks) | `Completada` |
| Fase 4: Verificación E2E (`docker compose up` stack completo sin pasos manuales) | `Completada` |

## Qué puede hacer ya el usuario / Qué falta

- [x] Levantar el stack completo con `docker compose up` desde `apps/infrastructure/` (PostgreSQL 18 + migraciones + backend + frontend).
- [x] Contar con `compose.yaml` (Docker Compose V2) que orqueste los cuatro servicios: `db`, `migrate`, `backend` y `frontend`.
- [x] Disponer de `.env.example` versionado con credenciales y URLs documentadas; `.env` local gitignored.
- [x] Ejecutar migraciones automáticamente en arranque mediante servicio `migrate` one-shot (`yoyo apply --batch`) antes de que arranque el backend.
- [x] Acceder a la UI en `http://localhost:8080` y a la API/OpenAPI en `http://localhost:8000` tras un único comando, sin intervención manual intermedia.
- [x] Resetear el entorno local documentado (`docker compose down -v`) cuando sea necesario.

## Coordinación multi-unidad

Esta unidad (`apps/infrastructure/`) es la cuarta de 4 unit-specs de la capacidad "EVM Project Tool", creadas en este orden fijo:

1. `evm-project-tool-db` — esquema PostgreSQL y migraciones. Ver [summary](../../db/evm-project-tool-db/summary.md).
2. `evm-project-tool-backend` — API REST y lógica de negocio EVM. Ver [summary](../../backend/evm-project-tool-backend/summary.md).
3. `evm-project-tool-frontend` — dashboard de presentación. Ver [summary](../../frontend/evm-project-tool-frontend/summary.md).
4. `evm-project-tool-infrastructure` (esta unidad) — orquestación Docker Compose de las 3 unidades anteriores.

**Depende de:** `evm-project-tool-backend` **y** `evm-project-tool-frontend` — ambas unidades deben tener sus Dockerfiles y contratos de servicio (puertos, variables de entorno, comandos de arranque) definidos antes de cerrar el wiring de este spec. También consume el esquema y las migraciones de `evm-project-tool-db` (volumen `../db/migrations` en el servicio `migrate`).

**Modelo de dominio (referencia conceptual, no duplicar):** [domain-model.md](../../backend/domain-model.md) — unidad dueña `backend`; infrastructure no implementa reglas de negocio EVM.

Condición de Done conjunto de la capacidad completa: las 4 unidades con todas sus tareas en `[x]`, TEST/AUDIT en verde por unidad, y la E2E cross-unidad (`docker compose up` completo levantando DB + migraciones + backend + frontend) pasando sin intervención manual.
