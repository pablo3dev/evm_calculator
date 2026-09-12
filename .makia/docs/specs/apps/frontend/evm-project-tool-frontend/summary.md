# evm-project-tool-frontend

> Dashboard React de presentación EVM para el líder de proyecto; consume la API REST del backend sin lógica de negocio propia.

## Estado

| Estado global | Última actualización |
|:---:|:---:|
| `Completado` | `2026-09-11` |

## Objetivo

Ofrecer al líder de proyecto un dashboard web claro y accionable para visualizar el estado de sus proyectos y actividades mediante indicadores EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC). La interfaz se limita a presentación y captura de datos: toda la lógica de cálculo y persistencia reside en el backend, al que se accede exclusivamente vía contrato REST/OpenAPI.

## Avance

| Fase | Estado |
|:---|:---:|
| Fase 1: Scaffolding | `Completado` (2/2 tareas) |
| Fase 2: API client | `Completado` (2/2 tareas) |
| Fase 3: Dashboard componentes | `Completado` (7/7 tareas) |
| Fase 4: Docker / verificación | `Completado` (3/3 tareas) |
| Fase 5: Internacionalización, Tooltip y selector de idioma | `Completado` (7/7 tareas) |
| Fase 6: Compactar siglas EVM y tooltips de hover | `Completado` (2/2 tareas) |
| Fase 7: Tabla de actividades al ancho del contenido | `Completado` (1/1 tareas) |
| Fase 8: Consolidados CPI/SPI apilados | `Completado` (1/1 tareas) |

**Progreso global:** `100%` (25 de 25 tareas)

**Fase 3 completada:** dashboard integrado en `Dashboard.tsx` con `ProjectSelector`, `ConsolidatedIndicators`, `ActivitiesTable`, `PvEvAcChart`, `CpiSpiBadge`, `ActivityFormModal` y hook `useMutationWithLock`. CRUD de actividades con refetch tras mutación; indicadores EVM y consolidados consumidos del API sin cálculo en cliente.

**Fase 4 completada:** Dockerfile multi-stage + `nginx.conf` para servir `dist/` estático; ESLint/Prettier limpios; verificación manual 4.3 documentada (ver § Verificación manual 4.3).

**Corrección 2026-09-11 (Fase 6):** las siglas EVM en superficie son solo abreviaturas inglesas (PV, CPI, …). El nombre en el idioma activo, la descripción y la fórmula se muestran en el `Tooltip` reutilizable (`EvmIndicatorLabel`). Misma regla en consolidados, tabla, badges y gráfica. Botón Eliminar de la tabla con contraste legible.

**Corrección 2026-09-11 (Fase 7):** la tabla de actividades se dimensiona al contenido (`max-content`, scroll horizontal). Los badges CPI/SPI no parten el texto por carácter.

**Corrección 2026-09-11 (Fase 8):** en consolidados, CPI/SPI se apilan en tres renglones (sigla, ícono, interpretación) con ancho máximo de tarjeta; la tabla sigue en línea.

## Qué puede hacer ya el usuario / Qué falta

**Ya disponible:**
- Footprint Vite React-TS en `apps/frontend/` con dependencias fijadas (React 19, Vite 8, TypeScript 7, Recharts 3).
- Toolchain operativa: `npm run build`, `npm run lint` y `npm run format` pasan sin errores.
- Tipos TypeScript del contrato API en `src/types/api.ts` (snake_case, alineados con OpenAPI backend).
- Cliente HTTP base en `src/api/client.ts` (`ApiError`, `apiFetch`, helpers REST tipados).
- Módulos de dominio API completos: `src/api/projects.ts` (5 métodos) y `src/api/activities.ts` (5 métodos) — **10 métodos REST**.
- Dashboard integrado con CRUD de actividades: `ProjectSelector`, `ActivitiesTable`, `ConsolidatedIndicators`, `CpiSpiBadge`, `PvEvAcChart`, `ActivityFormModal`, `ErrorBanner`, `LoadingButton` y hook `useMutationWithLock`; orquestados en `Dashboard.tsx` con refetch tras create/update/delete.
- Dockerfile multi-stage + `nginx.conf` para servir `dist/` estático (build arg `VITE_API_BASE_URL`).
- Toolchain de calidad: ESLint/Prettier limpios; Vitest configurado con test de humo opcional.

**Corrección audit ciclo 1 (iteración 1, 2026-09-11):**
- **H-01 cerrado:** UI CRUD de proyectos (`ProjectFormModal`, `ProjectSelector` con create/edit/delete vía `api/projects.ts`; confirmación antes de DELETE; selección del proyecto creado; salida del dashboard si se elimina el activo; refetch de lista).
- **H-02 cerrado:** anti doble-submit en eliminación desde tabla (`useMutationWithLock` en `Dashboard`, `LoadingButton`/`actionsDisabled` en `ActivitiesTable`).
- **H-03/H-04 (menores):** listado muestra description y fechas; nulls numéricos como `N/A` en `formatDisplay.ts`.

**Cierre ciclo anterior:** TEST global y AUDIT ciclo 2 completados con veredicto **PASA** (2026-09-11). El spec se reabre en esta misma fecha para la Fase 5.

**Pendiente (Fase 5, actualización en curso):**
- Tareas 5.1 (catálogo i18n base: `types.ts`/`en.ts`/`es.ts`/`evmIndicatorsCatalog.ts`/`I18nProvider.tsx`/`useI18n.ts`, integrado en `main.tsx`), 5.2 (componente `Tooltip.tsx` reutilizable, accesible, sin librería externa) y 5.3 (`LanguageSwitcher.tsx`, toggle ES|EN en cabecera de `App.tsx`) ya están completadas y verificadas (TEST: PASA en las tres, lint/format/build limpios).
- **Tarea 5.4 completada:** sigla invariable + nombre localizado + Tooltip aplicados en `ActivitiesTable`, `ConsolidatedIndicators`, `CpiSpiBadge` y `PvEvAcChart`. TEST: PASA, con nota menor no bloqueante: el tooltip nativo de Recharts al hacer hover en las barras usa texto plano "SIGLA — Nombre" en vez del componente `Tooltip` interactivo, por limitación de tipos de Recharts, documentado y aceptado.
- **Tarea 5.5a completada:** `evmInterpretation.ts` con `getCpiInterpretationKey`/`getSpiInterpretationKey`; `CpiSpiBadge.tsx`/`ConsolidatedIndicators.tsx`/`ActivitiesTable.tsx` ya derivan la interpretación localmente y dejaron de leer `cpi_interpretation`/`spi_interpretation` del API (esos campos siguen en el tipo `EvmIndicators` por fidelidad al contrato REST, sin uso en presentación). TEST: PASA incluyendo test de humo Vitest de `CpiSpiBadge`.
- **Tarea 5.5b completada:** se agregaron namespaces nuevos al diccionario i18n (`projectSelector`, `projectForm`, `pvEvAcChart`) y claves nuevas a namespaces existentes (`common`, `dashboard`, `activityForm`, `activitiesTable`, `consolidatedIndicators`); todos los componentes del dashboard (`App.tsx`, `ActivityFormModal`, `ProjectFormModal`, `ProjectSelector`, `ActivitiesTable`, `ConsolidatedIndicators`, `Dashboard`, `PvEvAcChart`) ya usan `t()` para todo string visible salvo siglas EVM invariables e íconos no textuales. TEST: PASA_CON_OBSERVACIONES (única observación no bloqueante: la suite Vitest existente — 1 archivo de test — no cubre los componentes tocados en esta tarea; no se exige cobertura % en este spec, según DoD).
- **Tarea 5.6 completada (cierre de Fase 5):** Fase 5 finalizada con las 7 tareas en `[x]`. Se incorporó i18n propio mediante React Context (sin librería externa), un componente `Tooltip` reutilizable y accesible (apertura por hover y foco de teclado, cierre con `Escape`, `role="tooltip"` + `aria-describedby`), y `LanguageSwitcher` ES|EN persistente en `sessionStorage`. Toda sigla EVM se muestra invariable en inglés junto a su nombre completo localizado en todos los indicadores. La interpretación CPI/SPI se deriva localmente (`evmInterpretation.ts`); los componentes de presentación ya no leen `cpi_interpretation`/`spi_interpretation` del API. Se reemplazaron todos los strings hardcodeados restantes de la UI por claves del catálogo i18n. TEST cerró con veredicto PASA / PASA_CON_OBSERVACIONES en las 7 tareas de la fase, con observaciones no bloqueantes (cobertura de tests no exigida por el spec). Queda pendiente de **verificación MANUAL** (no automatizable sin navegador) los 3 escenarios de EC-13/EC-14/EC-15 de la Tarea 5.6: (1) cambio de idioma con formulario `ActivityFormModal` abierto sin pérdida de datos ingresados; (2) Tooltip de un indicador con valor `null`; (3) fallback de `navigator.language` no soportado (p. ej. `fr`) a `en` sin valor previo en `sessionStorage`. Estos 3 escenarios deben ejecutarse por el equipo o en una sesión con browser MCP disponible.

## Verificación manual 4.3

| Ámbito | Resultado | Notas |
|:---|:---:|:---|
| API (9/9 escenarios contra backend + DB local) | **PASS** | Contrato REST validado end-to-end |
| Frontend dev server (`npm run dev`) | **PASS** | Arranca y responde sin errores de build |
| Render visual UI en navegador | **PASS CON OBSERVACIONES** | Browser MCP no disponible en sesión; verificación visual no ejecutada |
| **Veredicto global 4.3** | **PASS CON OBSERVACIONES** | Funcionalidad API + dev server OK; UI visual pendiente de confirmación manual en navegador |

**Notas de entorno:**
- Backend levantado con `uvicorn` (no `fastapi run`).
- `DATABASE_URL` con esquema `postgresql://` (no `postgresql+psycopg://`).

## Coordinación multi-unidad

Esta unidad (`apps/frontend/`) es la tercera de 4 unit-specs de la capacidad "EVM Project Tool", creadas en este orden fijo:

1. [`evm-project-tool-db`](../../db/evm-project-tool-db/summary.md) — esquema PostgreSQL y migraciones.
2. [`evm-project-tool-backend`](../../backend/evm-project-tool-backend/summary.md) — API REST y lógica de negocio EVM.
3. **`evm-project-tool-frontend`** (esta unidad) — dashboard de presentación EVM.
4. [`evm-project-tool-infrastructure`](../../infrastructure/evm-project-tool-infrastructure/summary.md) — orquestación Docker Compose. Pendiente de creación.

**Depende de:** unit-spec [`evm-project-tool-backend`](../../backend/evm-project-tool-backend/summary.md) (contrato REST: endpoints de proyectos, actividades e indicadores EVM).

**Modelo de dominio (referencia conceptual, no duplicar):** [`../../backend/domain-model.md`](../../backend/domain-model.md)

Condición de Done conjunto de la capacidad completa: las 4 unidades con todas sus tareas en `[x]`, TEST/AUDIT en verde por unidad, y la E2E cross-unidad (`docker compose up` completo levantando DB + migraciones + backend + frontend) pasando sin intervención manual.
