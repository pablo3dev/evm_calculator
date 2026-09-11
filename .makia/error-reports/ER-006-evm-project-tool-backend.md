# ER-006 — evm-project-tool-backend

- **Spec/idea afectado:** evm-project-tool-backend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-01 — "Primer fallo de TEST para una tarea en el ciclo interno de IMPLEMENT (CODE<->TEST)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-08 (Error propio de CODE — el handler de excepción 422 (`RequestValidationError`) serializaba `exc.errors()` directamente a JSONResponse; los valores `Decimal` en los errores de validación de Pydantic no son JSON-serializables nativamente, provocando fallo en tests de integración).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 4.1 (tests de integración REST), TEST ejecutó casos 422 (EC-08, EC-09, name vacío) contra los endpoints `/api/v1`. El handler de `RequestValidationError` en `infra/http/main.py` devolvía `JSONResponse(content={"detail": exc.errors()})` sin convertir tipos no serializables. Cuando los errores de validación incluían valores `Decimal` (campos monetarios/porcentaje del dominio EVM), la respuesta 422 fallaba al serializar. TEST detectó el fallo en la primera ejecución. CODE corrigió envolviendo con `jsonable_encoder(exc.errors())` de FastAPI. 1 iteración de corrección; el evento se reportó al Orquestador de forma asíncrona.

## Evidencia

- `bb8d384` — commit Tarea 4.1 (tests integración REST endpoints).
- `apps/backend/src/evm_project_tool/infra/http/main.py` L92–98 — handler 422 con `jsonable_encoder(exc.errors())`.
- `.makia/docs/specs/apps/backend/evm-project-tool-backend/tasks.md` Tarea 4.1 — casos 422 en tests de integración.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: que `design.md` o plantillas de CODE recuerden usar `jsonable_encoder` (o equivalente) en handlers de error que expongan payloads Pydantic con tipos no-JSON nativos (`Decimal`, `datetime`, etc.). Decisión de Triage pendiente — no se aplica en este reporte.
