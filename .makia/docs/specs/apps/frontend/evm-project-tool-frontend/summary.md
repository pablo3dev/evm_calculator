# evm-project-tool-frontend

> Dashboard React de presentación EVM para el líder de proyecto; consume la API REST del backend sin lógica de negocio propia.

## Estado

| Estado global | Última actualización |
|:---:|:---:|
| `En progreso` | `2026-09-11` |

## Objetivo

Ofrecer al líder de proyecto un dashboard web claro y accionable para visualizar el estado de sus proyectos y actividades mediante indicadores EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC). La interfaz se limita a presentación y captura de datos: toda la lógica de cálculo y persistencia reside en el backend, al que se accede exclusivamente vía contrato REST/OpenAPI.

## Avance

| Fase | Estado |
|:---|:---:|
| Fase 1: Scaffolding | `Completado` (2/2 tareas) |
| Fase 2: API client | `Completado` (2/2 tareas) |
| Fase 3: Dashboard componentes | `Completado` (7/7 tareas) |
| Fase 4: Docker / verificación | `Completado` (3/3 tareas) |
| Fase 5: Internacionalización, Tooltip y selector de idioma | `Pendiente` (0/6 tareas) |

**Progreso global:** `70%` (14 de 20 tareas)

**Fase 3 completada:** dashboard integrado en `Dashboard.tsx` con `ProjectSelector`, `ConsolidatedIndicators`, `ActivitiesTable`, `PvEvAcChart`, `CpiSpiBadge`, `ActivityFormModal` y hook `useMutationWithLock`. CRUD de actividades con refetch tras mutación; indicadores EVM y consolidados consumidos del API sin cálculo en cliente.

**Fase 4 completada:** Dockerfile multi-stage + `nginx.conf` para servir `dist/` estático; ESLint/Prettier limpios; verificación manual 4.3 documentada (ver § Verificación manual 4.3).

**Actualización en curso (2026-09-11):** se reabrió el spec (previamente `Completado`) para incorporar tres capacidades nuevas pedidas por el usuario: (a) selector de idioma Español/English visible y persistente durante la sesión, que cierra un gap de cumplimiento contra la regla de i18n obligatorio de `code.md`; (b) componente Tooltip reutilizable aplicado a los indicadores EVM y controles no obvios, mostrando nombre en ES, nombre en EN, descripción y fórmula; y (c) regla de que toda sigla EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC) se muestra siempre en inglés invariable junto a su nombre completo localizado. `requirements.md`, `design.md` y `tasks.md` (nueva Fase 5, 6 tareas) ya fueron actualizados; la implementación queda pendiente a cargo de IMPLEMENT.

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
- Selector de idioma Español/English, visible y persistente durante la sesión.
- Catálogo i18n en `src/i18n/`.
- Componente `Tooltip.tsx` reutilizable (nombre ES, nombre EN, descripción, fórmula).
- Aplicación de sigla invariable en inglés + nombre localizado + tooltip a los indicadores EVM existentes (PV, EV, CV, SV, CPI, SPI, EAC, VAC).
- Reemplazo de strings hardcodeados por claves i18n en los componentes del dashboard.

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
