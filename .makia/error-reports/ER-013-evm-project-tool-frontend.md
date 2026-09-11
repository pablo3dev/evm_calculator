# ER-013 — evm-project-tool-frontend

- **Spec/idea afectado:** evm-project-tool-frontend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-02 — "AUDIT emite veredicto RECHAZADA"
- **Etapa:** AUDIT
- **Causa raíz:** CR-04 (`tasks.md` mal particionado — Tarea 3.1 prescribe «Sin CRUD de proyectos en alcance mínimo salvo que `requirements.md` lo exija explícitamente», pero `requirements.md` ya exige REQ-02/REQ-03 con EARS «debe»; CODE/IMPLEMENT interpretó la tarea como excluir la UI CRUD y dejó `api/projects.ts` sin consumidores). Secundaria: CR-08 (Error propio de CODE — `Dashboard.handleDeleteFromTable` ejecutaba DELETE sin `useMutationWithLock`/`LoadingButton` pese a RN-UI-03 y `design.md` §7.2, mientras el modal de actividad sí aplicaba el lock).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Tras completar IMPLEMENT (todas las tareas `[x]`, lint/build/vitest PASS), el Orquestador delegó AUDIT ciclo 1 sobre `evm-project-tool-frontend`. AUDIT contrastó `requirements.md`, `design.md` y el código en `apps/frontend/src/` y emitió veredicto **RECHAZADA** con dos hallazgos bloqueantes: **H-01** (CRUD de proyectos ausente en UI — `createProject`/`updateProject`/`deleteProject` existen en `api/projects.ts` pero ningún componente los invoca; `ProjectSelector` solo lista/selecciona) y **H-02** (anti doble-submit incompleto en eliminación desde tabla — `Dashboard.handleDeleteFromTable` llama `deleteActivity` directamente sin deshabilitar acciones durante la petición DELETE). El Orquestador recibió `audit.md` y ordenó este error-report en paralelo; IMPLEMENT debe corregir H-01 y H-02 y solicitar re-auditoría (ciclo 2).

## Evidencia

- `fb65ec7` — commit `makia(evm-project-tool-frontend): audit — RECHAZADA`; añade `.makia/docs/specs/apps/frontend/evm-project-tool-frontend/audit.md` ciclo 1.
- `d35e7df` — último commit de código auditado (pre-`audit.md`): `ProjectSelector.tsx` solo importa `listProjects`; `Dashboard.tsx` L112–129 — `handleDeleteFromTable` con `try/await deleteActivity` sin `useMutationWithLock`.
- `.makia/docs/specs/apps/frontend/evm-project-tool-frontend/audit.md` §3 — H-01, H-02 (Bloqueante); §7 — veredicto RECHAZADA; tabla D-02 con archivos clave y acciones esperadas.
- `.makia/docs/specs/apps/frontend/evm-project-tool-frontend/tasks.md` Tarea 3.1 — «Sin CRUD de proyectos en alcance mínimo salvo que `requirements.md` lo exija explícitamente» vs REQ-02/REQ-03 en `requirements.md` In Scope («listado y CRUD de proyectos»).
- `apps/frontend/src/api/projects.ts` — métodos CRUD implementados; sin invocación desde componentes al momento de la auditoría.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: (1) eliminar o reformular la cláusula de alcance mínimo en `tasks.md` Tarea 3.1 para que no contradiga REQ-02/REQ-03, o añadir tarea explícita de UI CRUD proyecto; (2) que `design.md` §7.2 o checklist de CODE exija `useMutationWithLock` en **todos** los paths de mutación DELETE (tabla y modal), no solo en formularios modales. Decisión de Triage pendiente — no se aplica en este reporte.
