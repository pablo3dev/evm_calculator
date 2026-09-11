# ER-009 — evm-project-tool-frontend

- **Spec/idea afectado:** evm-project-tool-frontend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-04 — "Segunda iteración de corrección (estrategia distinta) en una misma tarea de IMPLEMENT, sea en el ciclo CODE<->TEST o tras un RECHAZADA de AUDIT" (variante: consolidación de commits por race en ejecución paralela de tareas `[P]`)
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-04 (`tasks.md` mal particionado — tareas 3.2 y 3.4 marcadas `[P]` paralelizables sin contrato explícito de un commit por tarea; la race entre agentes CODE paralelos agrupó entregables de 3.2/3.4 en el commit de 3.3, y el de 4.1 en el commit de 4.2).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

IMPLEMENT delegó en paralelo tareas marcadas `[P]` de Fase 3 (3.2 `ActivitiesTable`, 3.4 `CpiSpiBadge`) junto con 3.3 `ConsolidatedIndicators`. Por condición de carrera al consolidar commits, los archivos de 3.2 y 3.4 quedaron agrupados bajo el mensaje de commit de la Tarea 3.3 (`0520a46`), sin commits individuales trazables por tarea. En Fase 4 ocurrió el mismo patrón: el `Dockerfile` y `nginx.conf` de la Tarea 4.1 se incluyeron en el commit etiquetado como Tarea 4.2 (`e4ea483`). La trazabilidad commit↔tarea quedó degradada; IMPLEMENT reportó el evento al Orquestador de forma asíncrona sin bloquear el avance.

## Evidencia

- `0520a46` — mensaje `task 3.3 — ConsolidatedIndicators`; incluye `ActivitiesTable.tsx` (3.2), `ConsolidatedIndicators.tsx` (3.3) y `CpiSpiBadge.tsx` (3.4).
- `e4ea483` — mensaje `task 4.2 — Vitest smoke test y lint cleanup`; incluye `Dockerfile` y `nginx.conf` (4.1) junto con tests Vitest (4.2).
- `.makia/docs/specs/apps/frontend/evm-project-tool-frontend/tasks.md` — Tareas 3.2 y 3.4 marcadas `[P]`; Tareas 4.1 y 4.2 secuenciales pero sin regla de commit aislado.
- `.makia/config/git.md` — convención `makia(<spec-slug>): task X.Y` exige trazabilidad por tarea.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: que IMPLEMENT serialice commits por tarea aunque las tareas sean `[P]`, o que `tasks.md`/guía de IMPLEMENT declare explícitamente la regla de un commit por tarea con mensaje `makia(<slug>): task X.Y`. Decisión de Triage pendiente — no se aplica en este reporte.
