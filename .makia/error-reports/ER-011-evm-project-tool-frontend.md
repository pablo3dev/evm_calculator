# ER-011 — evm-project-tool-frontend

- **Spec/idea afectado:** evm-project-tool-frontend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-07 — "CODE escala a IMPLEMENT un gap de `learning.md` (necesita algo que `learning.md` no cubre)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-05 (Dato faltante en `learning.md` — prescribe cadena `postgresql+psycopg://` para yoyo/psycopg3, pero no aclara que el runtime del backend (`ConnectionPool` vía env `DATABASE_URL`) acepta y funciona con el esquema estándar `postgresql://` sin el prefijo `+psycopg`).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 4.3 (verificación manual contra backend + DB local), CODE/IMPLEMENT configuró `DATABASE_URL` para levantar el backend y ejecutar la verificación API. `learning.md` documenta la cadena `postgresql+psycopg://user:pass@host/db` (convención SQLAlchemy/yoyo), pero el código de conexión del backend (`infra/persistence/connection.py`) consume `DATABASE_URL` directamente con psycopg3, que acepta `postgresql://` sin el sufijo `+psycopg`. IMPLEMENT usó `postgresql://` en la verificación 4.3; la discrepancia con la documentación de IDEA generó fricción operativa al preparar el entorno. El evento se documentó en `summary.md` y se reportó al Orquestador de forma asíncrona.

## Evidencia

- `.makia/docs/specs/apps/frontend/evm-project-tool-frontend/summary.md` § Verificación manual 4.3 — "`DATABASE_URL` con esquema `postgresql://` (no `postgresql+psycopg://`)".
- `.makia/idea/evm-project-tool/learning.md` línea 54 — "Conexión PostgreSQL vía psycopg3: cadena `postgresql+psycopg://user:pass@host/db`".
- `apps/backend/src/evm_project_tool/infra/http/main.py` — lee `os.environ["DATABASE_URL"]`.
- `apps/backend/tests/integration/conftest.py` — construye URLs con esquema `postgresql://`.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: que `learning.md` distinga explícitamente el esquema de URL para yoyo-migrations (`postgresql+psycopg://`) vs. el esquema aceptado por psycopg3 `ConnectionPool` en runtime (`postgresql://` o `postgresql+psycopg://`). Decisión de Triage pendiente — no se aplica en este reporte.
