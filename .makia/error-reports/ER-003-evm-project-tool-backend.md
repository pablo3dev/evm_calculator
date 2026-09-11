# ER-003 — evm-project-tool-backend

- **Spec/idea afectado:** evm-project-tool-backend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-07 — "CODE escala a IMPLEMENT un gap de `learning.md` (necesita algo que `learning.md` no cubre)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-05 (Dato faltante en `learning.md` — no se documentó que `psycopg[pool]` en Windows requiere libpq instalado en el sistema, ni la alternativa `psycopg[binary,pool]` para entornos sin libpq).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 3.2 (repositorios PostgreSQL), CODE intentó usar `psycopg[pool]==3.2.10` según `tasks.md` Tarea 3.1/`design.md`. En Windows, la instalación/ejecución falló por ausencia de libpq (dependencia nativa no empaquetada con el extra `[pool]` solo). CODE escaló a IMPLEMENT un gap de `learning.md` que no cubría el requisito de libpq en Windows ni la variante `psycopg[binary,pool]`. IMPLEMENT resolvió cambiando la dependencia a `psycopg[binary,pool]==3.2.10` en `pyproject.toml`. El evento se reportó al Orquestador de forma asíncrona.

## Evidencia

- `a032fe8` — commit de Tarea 3.2 (repositorios PostgreSQL).
- `apps/backend/pyproject.toml` — dependencia final `psycopg[binary,pool]==3.2.10` (vs. `psycopg[pool]==3.2.10` prescrito en `tasks.md` Tarea 3.1).
- `.makia/docs/specs/apps/backend/evm-project-tool-backend/tasks.md` Tarea 3.1 — especifica `psycopg[pool]==3.2.10`.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: que IDEA documente en `learning.md` las variantes de extras de psycopg3 (`[pool]`, `[binary,pool]`) y sus requisitos por plataforma (Windows sin libpq vs. Linux/Docker con libpq del sistema). Decisión de Triage pendiente — no se aplica en este reporte.
