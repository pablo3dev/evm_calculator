# ER-010 — evm-project-tool-frontend

- **Spec/idea afectado:** evm-project-tool-frontend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-07 — "CODE escala a IMPLEMENT un gap de `learning.md` (necesita algo que `learning.md` no cubre)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-05 (Dato faltante en `learning.md` — documenta `uv run fastapi run` y el patrón Docker con `CMD ["fastapi", "run", ...]`, pero el backend no declara el extra `fastapi[standard]` que provee el CLI `fastapi run`; en la verificación 4.3 fue necesario levantar el backend con `uvicorn` directamente).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 4.3 (verificación manual dashboard vs backend local), CODE/IMPLEMENT necesitó levantar el backend para validar el contrato REST end-to-end. `learning.md` prescribe `uv run fastapi run`, pero el proyecto backend instala `fastapi` sin el extra `[standard]`, por lo que el comando `fastapi run` no estaba disponible en el entorno. IMPLEMENT resolvió usando `uvicorn` como entrypoint alternativo. El gap operativo se documentó en `summary.md` § Verificación manual 4.3 y se reportó al Orquestador de forma asíncrona.

## Evidencia

- `.makia/docs/specs/apps/frontend/evm-project-tool-frontend/summary.md` § Verificación manual 4.3 — "Backend levantado con `uvicorn` (no `fastapi run`)".
- `.makia/idea/evm-project-tool/learning.md` línea 30 — `uv run fastapi run`; línea 44 — `CMD ["fastapi", "run", ...]`.
- `apps/backend/pyproject.toml` — dependencia `fastapi` sin extra `[standard]`.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: alinear `learning.md` con la dependencia real del backend (`fastapi[standard]` vs. `uvicorn` explícito) y documentar el comando de arranque local recomendado para verificación cross-unidad. Decisión de Triage pendiente — no se aplica en este reporte.
