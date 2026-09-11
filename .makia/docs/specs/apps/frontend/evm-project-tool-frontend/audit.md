# Audit Report: evm-project-tool-frontend

## 1. Metadata
- **Spec Auditado:** `evm-project-tool-frontend`
- **Ruta:** `.makia/docs/specs/apps/frontend/evm-project-tool-frontend`
- **Fecha de Auditoría:** `2026-09-11`
- **Auditor:** `AUDIT`
- **Ciclo de Auditoría:** `2`

---

## 2. Alcance de la Verificación
- [x] El código implementado cumple con `requirements.md` (criterios EARS) y `design.md` (contratos, estructura de archivos).
- [x] El spec (`requirements.md`/`design.md`) está alineado con `domain-model.md` (lenguaje ubicuo, límites del Contexto Delimitado, entidades y reglas de negocio) — el frontend no es dueño del dominio; consume el contrato REST del backend sin duplicar entidades.

**Fuentes contrastadas:**
- `../../backend/domain-model.md` — referencia conceptual (indicadores EVM calculados en backend)
- `requirements.md` — RN-UI-01..RN-UI-09, REQ-01..REQ-12, EC-01..EC-12
- `design.md` — arquitectura presentación pura, contrato 10 endpoints §4.2, estructura §5
- Código: `apps/frontend/src/` (commits de corrección `0d40b4d`, `100c766`, `56e23e4`, `e190e49`)
- Evidencia TEST (informada por Orquestador): lint/build/vitest PASS tras fixes; browser visual no ejecutado

**Verificaciones de negocio UI (muestreo representativo):**

| Regla / REQ | Evidencia en código | Resultado |
|:---|:---|:---:|
| RN-UI-01 | Sin fórmulas PV/EV/CPI/SPI/EAC/VAC en `src/`; componentes solo leen `indicators` / `consolidated_indicators` del API | OK |
| RN-UI-02 / REQ-08 | `CpiSpiBadge.tsx`: color + ícono SVG + texto `interpretation` + `aria-label` + `role="status"` | OK |
| RN-UI-03 / REQ-09 | `ProjectFormModal`, `ActivityFormModal` y `Dashboard.handleDeleteFromTable` con `useMutationWithLock` + `LoadingButton`; `ActivitiesTable` recibe `actionsDisabled={isLocked}` | OK |
| RN-UI-04 | `ActivityFormModal`: inputs `type="number"` con `min`/`max`/`step` | OK |
| RN-UI-05 / REQ-10 | `ErrorBanner`, `ApiError` parsea 422/404; sin stack traces ni JSON crudo | OK |
| RN-UI-06 / REQ-06 | `Dashboard.refetch()` tras mutaciones exitosas en modal y delete desde tabla | OK |
| RN-UI-07 / EC-01/02 | `formatDisplay.ts`: `MISSING_VALUE = 'N/A'`; `CpiSpiBadge` muestra interpretación del API | OK |
| RN-UI-08 | Tipos y payloads en snake_case (`types/api.ts`, `api/client.ts`) | OK |
| RN-UI-09 | `ProjectSelector.sortProjects`: orden `updated_at` descendente en cliente | OK |
| Contrato 10 endpoints | `api/projects.ts` (5) + `api/activities.ts` (5) alineados con design §4.2 | OK (cliente) |
| REQ-01 | `ProjectSelector`: lista con `name`, `description` (si existe), `created_at`/`updated_at` formateados; estado vacío explícito | OK |
| REQ-02 / REQ-03 | `ProjectFormModal` + `ProjectSelector`: create/edit/delete vía `createProject`/`updateProject`/`deleteProject`; confirmación antes de delete; refetch y deselección si proyecto activo eliminado | OK |
| REQ-06 dashboard | `Dashboard.tsx`: `ConsolidatedIndicators`, `ActivitiesTable`, `PvEvAcChart`, CRUD actividades | OK |
| REQ-12 | `Dockerfile` multi-stage `node:24-slim` → `nginx:stable-alpine`; `nginx.conf` SPA fallback | OK |

---

## 3. Hallazgos y Desviaciones

### Ciclo 1 — resolución de bloqueantes

| ID | Estado | Evidencia de corrección |
|:---|:---:|:---|
| **H-01** | **Resuelto** | `ProjectFormModal.tsx` invoca `createProject`/`updateProject`/`deleteProject` con `useMutationWithLock` y `LoadingButton`. `ProjectSelector.tsx` expone «New project», listado enriquecido (nombre, descripción, fechas), «Edit project» y refetch tras mutación; `App.tsx` integra selector + dashboard. Cumple REQ-02, REQ-03, CA-03.4, CA-03.6, CA-03.7. |
| **H-02** | **Resuelto** | `Dashboard.tsx` L53-54, L114-134: `useMutationWithLock` envuelve `deleteActivity` + `refetch`. `ActivitiesTable.tsx` L14, L86-97: prop `actionsDisabled` deshabilita Edit y activa loader en Delete durante la petición. Cumple RN-UI-03 y REQ-09 CA-09.1/CA-09.2 para eliminación desde tabla. |
| **H-03** | **Resuelto** | `ProjectSelector.tsx` L163-170: muestra `description` y fechas con `formatDateTime`. Cumple REQ-01 CA-01.1. |
| **H-04** | **Resuelto** | `formatDisplay.ts` L1: `MISSING_VALUE = 'N/A'` en `formatMoney`, `formatPercent`, `formatIndicator`. Cumple RN-UI-07 y EC-01/EC-02. |

### Ciclo 2 — nuevos hallazgos

| ID | Descripción | Severidad | Referencia (REQ/DESIGN/domain-model) |
|:---|:---|:---:|:---|
| — | Sin hallazgos bloqueantes ni menores nuevos | — | — |

---

## 4. Supuestos Detectados
Sin supuestos detectados en ciclo 2. Las correcciones de IMPLEMENT iteración 1 están respaldadas por el spec funcional (`requirements.md` REQ-02, REQ-03, RN-UI-03, RN-UI-07).

---

## 5. Preguntas Abiertas
Sin preguntas abiertas.

---

## 6. Recomendaciones
> Mejoras sugeridas que **no** son bloqueantes — no afectan negocio ni funcionalidad, quedan a criterio de una futura iteración.

- **R-01:** Textos de UI en inglés (`Loading projects…`, `New activity`, etc.) mientras `requirements.md` indica UI en español sin framework i18n — alinear copy en iteración de polish.
- **R-02:** Verificación visual en navegador no ejecutada en TEST (browser MCP no disponible); confirmar manualmente layout dashboard, contraste WCAG AA de `CpiSpiBadge` y gráfica Recharts.
- **R-03:** Entorno local: `npm ci` EPERM reportado por TEST; documentar workaround (`npm install`) o permisos Windows si persiste en CI.
- **R-05:** Ampliar cobertura Vitest más allá del smoke de `CpiSpiBadge` (formulario actividad, `ErrorBanner` 422) según `design.md` §8.1 — opcional por spec.

---

## 7. Veredicto Final

**Veredicto:** `PASA`

Los hallazgos bloqueantes del ciclo 1 (**H-01** CRUD de proyectos, **H-02** anti doble-submit en delete desde tabla) quedaron corregidos y verificados en código. Los menores **H-03** (listado enriquecido) y **H-04** (nulls como «N/A») también se resolvieron. La capa de presentación cumple RN-UI-01..RN-UI-09, REQ-01..REQ-12 relevantes, contrato API de 10 endpoints, dashboard operativo y build/Docker (REQ-12). Quedan únicamente recomendaciones de polish (R-01, R-02, R-03, R-05), sin impacto funcional.

**Datos para error-report (D-02):**
| Hallazgo ciclo 1 | Estado | Commits de corrección |
|:---|:---|:---|
| H-01 | Cerrado | `0d40b4d` |
| H-02 | Cerrado | `100c766` |
| H-03 | Cerrado | `0d40b4d` |
| H-04 | Cerrado | `56e23e4` |
