# ER-015 — evm-project-tool-infrastructure

- **Spec/idea afectado:** evm-project-tool-infrastructure (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-07 — "CODE escala a IMPLEMENT un gap de `learning.md` (necesita algo que `learning.md` no cubre)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-05 (Dato faltante en `learning.md` — prescribe `CMD ["fastapi", "run", ...]` en el patrón Docker, pero el backend instala `fastapi` sin el extra `[standard]` que provee el CLI `fastapi run`; el `Dockerfile` del backend hereda ese gap y el contenedor no arranca con el CMD por defecto).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 3.3/4.1 (wiring del servicio `backend` y verificación E2E), el contenedor backend falló al arrancar: el `CMD` del `Dockerfile` hermano (`apps/backend/Dockerfile`) invoca `fastapi run`, pero la imagen no incluye el CLI porque `pyproject.toml` declara `fastapi` sin el extra `[standard]`. IMPLEMENT aplicó un workaround en `compose.yaml`: override de `command` con bootstrap de `ensurepip`, instalación de `uvicorn[standard]` y ejecución directa de `uvicorn`. Relacionado con ER-010 (mismo gap operativo, contexto frontend vs. infrastructure). El evento se reportó al Orquestador de forma asíncrona.

## Evidencia

- `1fdf461` — commit de cierre E2E infrastructure (13/13 tareas).
- `apps/backend/Dockerfile` línea 29 — `CMD ["fastapi", "run", ...]`.
- `apps/infrastructure/compose.yaml` líneas 32-35 — workaround: `command` con bootstrap `uvicorn[standard]`.
- `.makia/idea/evm-project-tool/learning.md` línea 44 — patrón Docker con `CMD ["fastapi", "run", ...]`.
- `apps/backend/pyproject.toml` — dependencia `fastapi` sin extra `[standard]`.
- ER-010 — reporte previo del mismo gap en contexto frontend (Tarea 4.3).

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: alinear `learning.md`, el `Dockerfile` del backend y el spec infrastructure — ya sea añadiendo `fastapi[standard]` al backend o documentando `uvicorn` como entrypoint canónico en Compose y eliminando el bootstrap ad-hoc. Decisión de Triage pendiente — no se aplica en este reporte.
