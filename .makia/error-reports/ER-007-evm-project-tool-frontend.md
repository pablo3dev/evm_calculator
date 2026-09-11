# ER-007 — evm-project-tool-frontend

- **Spec/idea afectado:** evm-project-tool-frontend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-06 — "La verificación local (lefthook: linter/formatter) marca errores tras el trabajo de CODE, es decir CODE + verificación local + `learning.md` no bastaron (incluye el agotamiento de los 2 reintentos de hook de CODE)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-05 (Dato faltante en `learning.md` — no se documentó la incompatibilidad de `typescript-eslint@8.x` con `typescript@7.0.2` ni el workaround oficial de preload con `@typescript/typescript6` para resolver el módulo `typescript` en ESLint).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 1.1 (footprint Vite React-TS), CODE fijó `typescript@7.0.2` y `typescript-eslint` según `tasks.md`/`design.md` §2.5. Al ejecutar `npm run lint`, `typescript-eslint` falló porque su parser interno aún no soporta TypeScript 7 de forma nativa. CODE aplicó un workaround no previsto en el spec: añadió `@typescript/typescript6` como devDependency, creó `eslint.typescript6-resolver.cjs` (preload que redirige `require('typescript')` al paquete TS6) y modificó el script `lint` para cargar ese preload con `node --require`. IMPLEMENT reportó el evento al Orquestador de forma asíncrona; el lint pasó tras el workaround.

## Evidencia

- `3ed557a` — commit Tarea 1.1 (introduce `eslint.typescript6-resolver.cjs`, `@typescript/typescript6` y script `lint` con preload).
- `apps/frontend/eslint.typescript6-resolver.cjs` — redirección de `require('typescript')` a `@typescript/typescript6`.
- `apps/frontend/package.json` — `"lint": "node --require ./eslint.typescript6-resolver.cjs ./node_modules/eslint/bin/eslint.js ."`.
- `.makia/docs/specs/apps/frontend/evm-project-tool-frontend/tasks.md` Tarea 1.1 — prescribe `typescript@7.0.2` y `typescript-eslint` sin mencionar el resolver.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: documentar en `learning.md` la matriz de compatibilidad `typescript-eslint` ↔ TypeScript 7 y el patrón de preload con `@typescript/typescript6`; opcionalmente listar `eslint.typescript6-resolver.cjs` en la tabla de archivos de `design.md` §5. Decisión de Triage pendiente — no se aplica en este reporte.
