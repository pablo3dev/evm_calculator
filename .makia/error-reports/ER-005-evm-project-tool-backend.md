# ER-005 — evm-project-tool-backend

- **Spec/idea afectado:** evm-project-tool-backend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-01 — "Primer fallo de TEST para una tarea en el ciclo interno de IMPLEMENT (CODE<->TEST)" (secundario: D-04 — "Segunda iteración de corrección (estrategia distinta) en una misma tarea de IMPLEMENT")
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-08 (Error propio de CODE — violaciones de ruff E501 línea demasiado larga, F401 import no usado, UP017 uso de `datetime.UTC` en lugar de `timezone.utc`; el spec y `design.md` §5 ya prescribían `ruff check`/`ruff format --check` sin errores).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante las Tareas 3.1 (proyecto base) y 4.2 (verificación cobertura y linter), CODE entregó código que no pasaba `ruff check` en la primera verificación: errores E501 (líneas > límite), F401 (imports sin usar) y UP017 (preferencia `datetime.UTC` vs. `timezone.utc`). TEST/verificación local detectó los fallos. IMPLEMENT ejecutó 2 iteraciones de corrección con estrategia distinta (primera: correcciones puntuales de imports y longitud; segunda: ajustes de estilo datetime y barrido restante) antes de que `ruff check` y `ruff format --check` pasaran limpios. El evento se reportó al Orquestador de forma asíncrona.

## Evidencia

- `c6aaede` — commit Tarea 3.1 (proyecto base; origen de parte de las violaciones).
- `2efb688` — commit Tarea 4.2 (verificación cobertura y linter; cierre tras correcciones ruff).
- `.makia/docs/specs/apps/backend/evm-project-tool-backend/tasks.md` Tareas 3.1 y 4.2 — exigen `ruff==0.16.3` y verificación sin errores.
- `.makia/docs/specs/apps/backend/evm-project-tool-backend/design.md` §5 — reglas de linter.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. El spec ya prescribía ruff; la fricción fue de ejecución (CR-08). Decisión de Triage pendiente — no se aplica en este reporte.
