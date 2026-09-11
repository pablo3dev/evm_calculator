# ER-012 — evm-project-tool-frontend

- **Spec/idea afectado:** evm-project-tool-frontend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-01 — "Primer fallo de TEST para una tarea en el ciclo interno de IMPLEMENT (CODE<->TEST)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-05 (Dato faltante en `learning.md` — no se documentó que Recharts 3.x con React 19 requiere `react-is` como dependencia directa explícita para que `npm run build` resuelva el peer dependency en modo estricto/producción).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la integración del dashboard (Tareas 3.5–3.7), CODE implementó `PvEvAcChart` con Recharts 3.10.1 según `tasks.md`. Al ejecutar `npm run build` (`tsc -b && vite build`), el bundler falló por dependencia peer `react-is` no resuelta (Recharts la declara como peer pero no la instala transitivamente de forma fiable con React 19). CODE añadió `react-is@^19.3.0` como dependencia directa en `package.json`. IMPLEMENT reportó el evento al Orquestador de forma asíncrona; el build pasó tras la corrección.

## Evidencia

- `c3e81e0` — commit Tarea 3.7; diff en `package.json` añade `"react-is": "^19.3.0"`.
- `8c6c3d9` — commit Tarea 3.5 (`PvEvAcChart.tsx` con Recharts).
- `apps/frontend/package.json` — `react-is` en `dependencies` junto a `recharts@3.10.1`.
- `.makia/docs/specs/apps/frontend/evm-project-tool-frontend/tasks.md` Tarea 1.1 — fija `recharts@3.10.1` sin mencionar `react-is`.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: documentar en `learning.md` la dependencia explícita `react-is` al usar Recharts 3 con React 19, o incluirla en la lista de dependencias fijadas de `tasks.md` Tarea 1.1. Decisión de Triage pendiente — no se aplica en este reporte.
