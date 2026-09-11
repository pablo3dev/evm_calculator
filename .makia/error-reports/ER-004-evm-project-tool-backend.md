# ER-004 — evm-project-tool-backend

- **Spec/idea afectado:** evm-project-tool-backend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-01 — "Primer fallo de TEST para una tarea en el ciclo interno de IMPLEMENT (CODE<->TEST)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-08 (Error propio de CODE — el spec en `tasks.md` Tarea 2.3 exigía extender tests unitarios para los casos de uso de consulta con indicadores; CODE entregó la implementación sin esos tests en la primera iteración).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 2.3 (casos de uso de consulta con indicadores EVM), CODE implementó `get_project`, `list_activities` y `get_activity` pero omitió los tests unitarios que `tasks.md` requería explícitamente ("Extender tests unitarios de application verificando invocación de dominio e inclusión de interpretaciones CPI/SPI"). TEST detectó la ausencia de cobertura de los nuevos use cases en la primera ejecución. IMPLEMENT delegó 1 iteración de corrección a CODE, que añadió los tests faltantes en `tests/unit/application/test_use_cases.py`. El evento se reportó al Orquestador de forma asíncrona en paralelo a la corrección.

## Evidencia

- `159f9c7` — commit de Tarea 2.3 (casos de uso consulta con indicadores, incluye tests tras corrección).
- `.makia/docs/specs/apps/backend/evm-project-tool-backend/tasks.md` Tarea 2.3 — contrato de tests unitarios para query use cases.
- `apps/backend/tests/unit/application/test_use_cases.py` — tests de consulta con indicadores e interpretaciones CPI/SPI.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. El spec (`tasks.md`) ya prescribía los tests; la fricción fue de ejecución (CR-08). Decisión de Triage pendiente — no se aplica en este reporte.
