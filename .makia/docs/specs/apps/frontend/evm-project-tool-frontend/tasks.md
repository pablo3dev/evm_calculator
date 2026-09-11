# Implementation Tasks: EVM Project Tool Frontend

## 1. Metadata & Traceability
- **Spec:** `evm-project-tool-frontend`
- **Requirements Ref:** `requirements.md` (spec: `evm-project-tool-frontend`)
- **Design Ref:** `design.md` (spec: `evm-project-tool-frontend`)

`[P]`: puede ejecutarse en paralelo (archivos distintos, sin dependencias entre sí dentro de la misma fase).

> **Nota footprint:** este spec **no** incluye tarea de `lefthook.yml` — la unit-spec db (`evm-project-tool-db`, Tarea 1.1) ya cubre verificación pre-commit de `apps/frontend/` (`frontend-lint`, `frontend-format`); documentado en `design.md` §2.5.

---

## 2. Execution Guidelines
- **Sequential Ordering:** ejecutar las fases en orden estricto (Fase 1 → 2 → 3 → 4); dentro de cada fase, respetar dependencias entre tareas (p. ej. 2.2 depende de 2.1; 3.7 depende de 3.1–3.6).
- **Test-Verified:** cada funcionalidad debe tener su prueba correspondiente antes de marcarse `[x]` (lint/format como mínimo; tests de componente Vitest opcionales según `design.md` §8).
- **Traceability Tags:** cada tarea referencia su origen en `requirements.md` (ej. `[REQ-06]`) y su componente en `design.md` (ej. `[DESIGN §4]`).
- **Sin lógica EVM en cliente:** el frontend **nunca** calcula PV/EV/CPI/etc.; solo consume y presenta valores del API (`RN-UI-01`). Referencia conceptual de dominio (solo lectura): [`../../backend/domain-model.md`](../../backend/domain-model.md).
- **Dependencia externa:** requiere backend API implementado y accesible (`evm-project-tool-backend` — contrato REST §4.2 en [`../../backend/evm-project-tool-backend/design.md`](../../backend/evm-project-tool-backend/design.md)) antes de Fase 3.7 (integración dashboard) y Fase 4.3 (verificación manual).

---

## 3. Phase Breakdown & Actionable Tasks

### Fase 1: Scaffolding y toolchain
- [x] **Tarea 1.1: Footprint Vite React-TS y toolchain** `[REQ-06]` `[DESIGN §2.5]` `[DESIGN §5]` — crear `apps/frontend/` con scaffolding `npm create vite@latest apps/frontend -- --template react-ts` y ajustar `package.json` con dependencias **fijadas**: `react@19.3.0`, `react-dom@19.3.0`, `typescript@7.0.2`, `vite@8.0.10`, `recharts@3.10.1`; devDependencies: `eslint@10.10.0`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier@3.9.6`, `eslint-config-prettier`. Configurar `eslint.config.js` (flat config), `.prettierrc` (o equivalente), `vite.config.ts`, `tsconfig.json`/`tsconfig.app.json`, `index.html`, `src/main.tsx`, `src/App.tsx` (shell mínimo), `.gitignore` en `apps/frontend/` (`node_modules`, `dist`, `.env.local`, etc.). Añadir script npm `dev`, `build`, `lint`, `format`. Variable de entorno documentada: `VITE_API_BASE_URL` (default dev `http://localhost:8000/api/v1`). **No** crear `lefthook.yml` (§2.5).
- [x] **Tarea 1.2: [P] Tipos TypeScript del contrato API** `[REQ-01]` `[REQ-02]` `[REQ-03]` `[REQ-05]` `[DESIGN §3]` `[DESIGN §5]` — implementar `src/types/api.ts` espejando **exactamente** los schemas Pydantic/OpenAPI del backend (`design.md` backend §4.2): `ProjectResponse`, `ProjectCreateRequest`, `ProjectUpdateRequest`, `ProjectDetailResponse`, `ActivityCreateRequest`, `ActivityUpdateRequest`, `ActivityWithIndicatorsResponse`, `EvmIndicators` (campos `cpi`/`spi`/`eac`/`vac` nullable), `HTTPValidationError`, `HTTPError`. JSON en **snake_case**; sin entidades de dominio propias ni tipos camelCase duplicados.

### Fase 2: Cliente API
- [x] **Tarea 2.1: Cliente HTTP base (`api/client.ts`)** `[REQ-02]` `[REQ-05]` `[RN-UI-05]` `[DESIGN §4]` `[DESIGN §7.1]` — implementar wrapper `fetch` (o axios si se documenta en design) con base URL desde `import.meta.env.VITE_API_BASE_URL`, headers `Content-Type: application/json`, parseo de respuestas JSON. Clase/función de error tipada (`ApiError`) que distingue: **422** (`detail[]` con `loc`/`msg`), **404** (`detail` string), errores de red/5xx genéricos. Exportar helpers `get`, `post`, `put`, `delete` usados por los módulos de dominio API. Sin lógica de negocio EVM.
- [x] **Tarea 2.2: [P] Módulos `api/projects.ts` y `api/activities.ts`** `[REQ-01]` `[REQ-02]` `[DESIGN §4]` `[DESIGN §5]` — implementar **10 métodos** 1:1 con endpoints backend §4.2:
  - `projects.ts`: `listProjects()`, `createProject(body)`, `getProject(projectId)`, `updateProject(projectId, body)`, `deleteProject(projectId)`.
  - `activities.ts`: `listActivitiesByProject(projectId)`, `createActivity(projectId, body)`, `getActivity(activityId)`, `updateActivity(activityId, body)`, `deleteActivity(activityId)`.
  Tipos de retorno alineados con `src/types/api.ts`; propagar `ApiError` sin tragar códigos HTTP.

### Fase 3: Dashboard y componentes UI
- [x] **Tarea 3.1: `ProjectSelector` y routing básico** `[REQ-01]` `[DESIGN §2]` `[DESIGN §5]` — componente `ProjectSelector` que carga `listProjects()`, permite seleccionar proyecto activo (`project_id` en estado React — contexto, URL hash o state lifting según `design.md`), muestra nombre del proyecto seleccionado y estados loading/error. Integrar en `App.tsx` o layout raíz; al cambiar proyecto, propagar `projectId` a hijos del dashboard. Sin CRUD de proyectos en alcance mínimo salvo que `requirements.md` lo exija explícitamente.
- [x] **Tarea 3.2: `ActivitiesTable` con indicadores del API** `[REQ-03]` `[REQ-04]` `[EC-01]` `[EC-02]` `[DESIGN §5]` — componente `ActivitiesTable` que recibe `ActivityWithIndicatorsResponse[]` y renderiza columnas: nombre, `budget_at_completion`, `planned_progress_percentage`, `actual_progress_percentage`, `actual_cost`, PV, EV, CV, SV, CPI, SPI, EAC, VAC (valores de `indicators`). Indicadores `null` → mostrar `N/A` o guion, **nunca** `NaN`/`Infinity` (EC-01, EC-02). Integrar `CpiSpiBadge` por fila para CPI/SPI. Acciones editar/eliminar por fila (handlers provistos por padre). Tabla vacía legible cuando proyecto sin actividades (EC-03).
- [x] **Tarea 3.3: `ConsolidatedIndicators`** `[REQ-05]` `[EC-03]` `[DESIGN §5]` — bloque `ConsolidatedIndicators` que muestra `consolidated_indicators` de `ProjectDetailResponse` (PV, EV, CV, SV, CPI, SPI, EAC, VAC + interpretaciones). Manejar proyecto sin actividades: valores null con textos de interpretación del API, sin error visual. Reutilizar `CpiSpiBadge` para CPI/SPI consolidados.
- [x] **Tarea 3.4: `CpiSpiBadge` accesible** `[REQ-04]` `[RN-UI-02]` `[DESIGN §5]` `[DESIGN §7.2]` — componente `CpiSpiBadge` que recibe valor numérico nullable + `*_interpretation` del API. **Siempre** color + ícono + texto visible (`aria-label` con interpretación); nunca solo color. Mapeo documentado en `design.md`: null → neutral/gris; favorable (CPI>1, SPI>1) → verde + ícono positivo; desfavorable → rojo/ámbar + ícono de alerta. Mostrar interpretación textual del backend sin recalcular.
- [x] **Tarea 3.5: `PvEvAcChart` (Recharts)** `[REQ-06]` `[DESIGN §2.5]` `[DESIGN §5]` — componente `PvEvAcChart` con Recharts (`BarChart` agrupado o `ComposedChart` según `design.md`) comparando **pv**, **ev** y **ac** por actividad (eje X = nombre actividad, leyenda clara). Datos tomados de `indicators` + `actual_cost` del API; sin cálculos cliente. Responsive básico; tooltip con valores formateados.
- [x] **Tarea 3.6: `ActivityFormModal` CRUD + `useMutationWithLock`** `[REQ-02]` `[RN-UI-03]` `[RN-UI-04]` `[RN-UI-05]` `[EC-04..EC-09]` `[DESIGN §5]` `[DESIGN §7.2]` — modal `ActivityFormModal` para crear/editar actividad (`ActivityCreateRequest`/`ActivityUpdateRequest`): campos `name`, `budget_at_completion`, `planned_progress_percentage`, `actual_progress_percentage`, `actual_cost` con `type="number"` y atributos `min`/`max`/`step` acordes (RN-UI-04). Hook `useMutationWithLock` deshabilita submit y muestra loader durante petición (anti doble-submit, RN-UI-03). Mostrar errores 422/404 del API en banner o inline (`ErrorBanner`), preservando datos del formulario cuando aplique (EC-08, EC-09). Confirmación antes de eliminar. Callback `onSuccess` para refetch.
- [x] **Tarea 3.7: Integrar `Dashboard.tsx`** `[REQ-06]` `[REQ-03]` `[REQ-05]` `[DESIGN §2]` `[DESIGN §5]` — página `Dashboard.tsx` que orquesta: `ProjectSelector` → carga paralela `getProject(projectId)` + `listActivitiesByProject(projectId)` → `ConsolidatedIndicators` + `ActivitiesTable` + `PvEvAcChart` + botón "Nueva actividad" → `ActivityFormModal`. Tras create/update/delete exitoso, **refetch** datos del proyecto y actividades (o usar respuesta del API que ya incluye indicadores) para reflejar recálculo inmediato (REQ-06). Estados loading/error globales. **Requiere backend local** levantado para validación funcional.

### Fase 4: Docker, verificación y polish
- [ ] **Tarea 4.1: Dockerfile multi-stage + `nginx.conf`** `[DESIGN §2.5]` `[DESIGN §5]` — `apps/frontend/Dockerfile`: stage build `node:24-slim` (`npm ci`, `npm run build`), stage runtime `nginx:stable-alpine` sirviendo `dist/` estático. `nginx.conf` con `try_files` para SPA (fallback `index.html`), compresión gzip básica, puerto 80. Build arg/env `VITE_API_BASE_URL` inyectable en build time. Sin `docker-compose` (responsabilidad `evm-project-tool-infrastructure`).
- [ ] **Tarea 4.2: Limpieza ESLint/Prettier; tests componente opcionales** `[DESIGN §8]` `[DESIGN §5]` — ejecutar `npx eslint .` y `npx prettier --check .` sobre `apps/frontend/` sin errores (también cubierto por `lefthook.yml` de db spec en pre-commit). Si `design.md` §8 define tests Vitest + React Testing Library: configurar Vitest mínimo y al menos 1 test de humo (p. ej. `CpiSpiBadge` renderiza texto de interpretación); **no** es obligación de cobertura % en frontend. Sin code smells: sin imports muertos, sin `console.log` de debug.
- [ ] **Tarea 4.3: Verificación manual del dashboard contra backend local** `[REQ-06]` `[REQ-02]` `[REQ-03]` `[REQ-04]` `[REQ-05]` `[EC-01]` `[EC-02]` `[EC-03]` `[DESIGN §8.3]` — con backend + DB en local (o staging): (1) seleccionar proyecto existente; (2) ver tabla con indicadores e interpretaciones CPI/SPI; (3) ver bloque consolidado; (4) ver gráfica PV/EV/AC; (5) crear actividad → indicadores actualizados tras save; (6) editar actividad → refetch correcto; (7) eliminar actividad → tabla y consolidado actualizados; (8) proyecto sin actividades → UI estable sin errores; (9) actividad con AC=0 → CPI null mostrado como N/A + interpretación, no Infinity. Documentar resultado (pass/fail) en comentario de PR o nota mínima en `summary.md` al cerrar IMPLEMENT.

---

## 4. Execution Progress Tracker
| Fase | Total Tareas | Completadas | Estado |
|:---|:---:|:---:|:---|
| Fase 1: Scaffolding y toolchain | 2 | 2 | `Completado` |
| Fase 2: Cliente API | 2 | 2 | `Completado` |
| Fase 3: Dashboard y componentes UI | 7 | 7 | `Completado` |
| Fase 4: Docker, verificación y polish | 3 | 0 | `En progreso` |
| **Total Global** | **14** | **11** | **~79%** |

---

## 5. Definition of Done (DoD) Gate
- [ ] Todas las tareas están marcadas como completadas (`[x]`).
- [ ] Todos los criterios EARS de `requirements.md` (REQ-01..REQ-06) pasan las pruebas asociadas o verificación manual documentada.
- [ ] Reglas `RN-UI-01`..`RN-UI-05` verificadas; edge cases UI EC-01..EC-09 con comportamiento visual correcto (nulls, tabla vacía, errores 422/404).
- [ ] La estructura de archivos coincide con el mapeo de `design.md` §5 (footprint exclusivo `apps/frontend/`).
- [ ] Cliente API expone los 10 métodos del contrato backend §4.2 sin desviaciones de tipos.
- [ ] Dashboard integrado: tabla + consolidados + gráfica + CRUD actividades con refetch tras mutación.
- [ ] `CpiSpiBadge` cumple accesibilidad: color + ícono + texto en todos los estados CPI/SPI.
- [ ] `eslint` y `prettier --check` limpios sobre `apps/frontend/`.
- [ ] Imagen Docker frontend construye y sirve `dist/` vía nginx.
- [ ] Verificación manual Fase 4.3 completada contra backend local.
- [ ] **No** se creó ni modificó `lefthook.yml` desde este spec.
- [ ] **No** hay cálculos EVM en código cliente (solo presentación de datos del API).
- [ ] La fila del spec en el `INDEX.md` de specs (`.makia/docs/specs/<categoría>/INDEX.md`) está sincronizada con el `Estado global` de `summary.md`.

---

> IMPLEMENT ejecuta este documento tarea por tarea. Cada tarea se valida con un TEST acotado a sus propios archivos (no la suite completa) antes de marcarse `[x]`. Máximo 2 iteraciones de corrección por tarea antes de cancelar y escalar (ver sub-orchestrator.md del Orquestador).
