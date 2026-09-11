# ER-008 — evm-project-tool-frontend

- **Spec/idea afectado:** evm-project-tool-frontend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-01 — "Primer fallo de TEST para una tarea en el ciclo interno de IMPLEMENT (CODE<->TEST)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-05 (Dato faltante en `learning.md` — no se documentó que `npm ci` en Docker requiere copiar `.npmrc` cuando el proyecto usa `legacy-peer-deps=true` para resolver conflictos de peer dependencies de Recharts/React 19).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 4.1 (Dockerfile multi-stage), CODE creó inicialmente un `Dockerfile` que copiaba solo `package.json` y `package-lock.json` antes de `npm ci`. El build falló porque `npm ci` en el contenedor no heredaba la configuración `legacy-peer-deps=true` definida en `apps/frontend/.npmrc` (creada en Tarea 1.1 para instalar dependencias localmente). CODE corrigió añadiendo `.npmrc` al `COPY` del stage de build. IMPLEMENT reportó el evento al Orquestador de forma asíncrona.

## Evidencia

- `e4ea483` — commit Tarea 4.2 (incluye `Dockerfile` con `COPY package.json package-lock.json .npmrc ./`).
- `apps/frontend/Dockerfile` línea 7 — `COPY package.json package-lock.json .npmrc ./`.
- `apps/frontend/.npmrc` — `legacy-peer-deps=true` (creado en `3ed557a`, Tarea 1.1).
- `.makia/docs/specs/apps/frontend/evm-project-tool-frontend/tasks.md` Tarea 4.1 — prescribe Dockerfile multi-stage sin mencionar `.npmrc`.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: documentar en `learning.md` el requisito de copiar `.npmrc` en builds Docker cuando se use `legacy-peer-deps`; actualizar `design.md` §2.5/§5 con nota explícita en la tabla de archivos del Dockerfile. Decisión de Triage pendiente — no se aplica en este reporte.
