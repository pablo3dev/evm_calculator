# Audit Report: evm-project-tool-frontend

## 1. Metadata
- **Spec Auditado:** `evm-project-tool-frontend`
- **Ruta:** `.makia/docs/specs/apps/frontend/evm-project-tool-frontend`
- **Fecha de Auditoría:** `2026-09-11`
- **Auditor:** `AUDIT`
- **Ciclo de Auditoría:** `1`

---

## 2. Alcance de la Verificación
- [ ] El código implementado cumple con `requirements.md` (criterios EARS) y `design.md` (contratos, estructura de archivos).
- [x] El spec (`requirements.md`/`design.md`) está alineado con `domain-model.md` (lenguaje ubicuo, límites del Contexto Delimitado, entidades y reglas de negocio) — el frontend no es dueño del dominio; consume el contrato REST del backend sin duplicar entidades.

**Fuentes contrastadas:**
- `../../backend/domain-model.md` — referencia conceptual (indicadores EVM calculados en backend)
- `requirements.md` — RN-UI-01..RN-UI-09, REQ-01..REQ-12, EC-01..EC-12
- `design.md` — arquitectura presentación pura, contrato 10 endpoints §4.2, estructura §5
- Código: `apps/frontend/src/`
- Evidencia TEST (informada por Orquestador): lint/build/vitest PASS, footprint sin fórmulas EVM en cliente, docker build OK; browser visual no ejecutado; `npm ci` EPERM local con `npm install` OK

**Verificaciones de negocio UI (muestreo representativo):**

| Regla / REQ | Evidencia en código | Resultado |
|:---|:---|:---:|
| RN-UI-01 | Sin fórmulas PV/EV/CPI/SPI/EAC/VAC en `src/`; componentes solo leen `indicators` / `consolidated_indicators` del API | OK |
| RN-UI-02 / REQ-08 | `CpiSpiBadge.tsx`: color + ícono SVG + texto `interpretation` + `aria-label` + `role="status"` | OK |
| RN-UI-03 / REQ-09 | `ActivityFormModal` + `useMutationWithLock` + `LoadingButton` en create/edit/delete modal | Parcial |
| RN-UI-04 | `ActivityFormModal`: inputs `type="number"` con `min`/`max`/`step` | OK |
| RN-UI-05 / REQ-10 | `ErrorBanner`, `ApiError` parsea 422/404; sin stack traces ni JSON crudo | OK |
| RN-UI-06 / REQ-06 | `Dashboard.refetch()` tras mutaciones exitosas en modal | OK |
| RN-UI-07 / EC-01/02 | `formatDisplay.ts` devuelve `—` para null; `CpiSpiBadge` muestra interpretación del API | Parcial |
| RN-UI-08 | Tipos y payloads en snake_case (`types/api.ts`, `api/client.ts`) | OK |
| Contrato 10 endpoints | `api/projects.ts` (5) + `api/activities.ts` (5) alineados con design §4.2 | OK (cliente) |
| REQ-06 dashboard | `Dashboard.tsx`: `ConsolidatedIndicators`, `ActivitiesTable`, `PvEvAcChart`, CRUD actividades | OK |
| REQ-02 / REQ-03 | CRUD proyectos en UI | **No cumplido** |
| REQ-12 | `Dockerfile` multi-stage `node:24-slim` → `nginx:stable-alpine`; `nginx.conf` SPA fallback | OK |

---

## 3. Hallazgos y Desviaciones
| ID | Descripción | Severidad | Referencia (REQ/DESIGN/domain-model) |
|:---|:---|:---:|:---|
| **H-01** | **CRUD de proyectos ausente en UI.** `createProject`, `updateProject` y `deleteProject` están implementados en `api/projects.ts` pero no se invocan desde ningún componente. No existe formulario/modal para crear proyecto (REQ-02), ni flujos de edición/eliminación con confirmación (REQ-03 CA-03.6). `ProjectSelector` solo lista y selecciona. El In Scope de `requirements.md` exige explícitamente «listado y CRUD de proyectos». | `Bloqueante` | `REQ-02`, `REQ-03`, `requirements.md` In Scope, `design.md` §5 `ProjectSelector` + flujos proyecto |
| **H-02** | **Anti doble-submit incompleto en eliminación desde tabla.** `Dashboard.handleDeleteFromTable` ejecuta `deleteActivity` directamente sin `useMutationWithLock` ni `LoadingButton`; los botones Delete/Edit de `ActivitiesTable` permanecen activos durante la petición DELETE. Incumple RN-UI-03 y REQ-09 CA-09.1/CA-09.2 para mutaciones equivalentes a «Eliminar». El modal de actividad sí aplica el lock correctamente. | `Bloqueante` | `RN-UI-03`, `REQ-09`, `design.md` §7.2 |
| **H-03** | **Listado de proyectos incompleto respecto a REQ-01.** `ProjectSelector` muestra solo `name` en `<select>`; no presenta `description` (si existe) ni fechas `created_at`/`updated_at` formateadas como exige CA-01.1. | `Menor` | `REQ-01` CA-01.1 |
| **H-04** | **Nulls numéricos con guión, no «N/A».** `formatDisplay.ts` usa constante `MISSING_VALUE = '—'` para indicadores null (`eac`, `vac`, etc.). RN-UI-07 y EC-01/EC-02 piden explícitamente «N/A» o texto interpretativo; el guión cumple parcialmente (sin NaN/Infinity) pero no la literalidad del spec. `CpiSpiBadge` sí muestra interpretación textual del API para CPI/SPI. | `Menor` | `RN-UI-07`, `EC-01`, `EC-02`, `design.md` §7.1 |

---

## 4. Supuestos Detectados
- **IMPLEMENT/Tarea 3.1** asumió «sin CRUD de proyectos en alcance mínimo» pese a que `requirements.md` exige REQ-02 y REQ-03 de forma explícita (EARS «debe»). El cliente API quedó preparado pero la UI no expone los flujos — decisión no respaldada por el spec funcional aprobable.

---

## 5. Preguntas Abiertas
Sin preguntas abiertas.

---

## 6. Recomendaciones
> Mejoras sugeridas que **no** son bloqueantes — no afectan negocio ni funcionalidad, quedan a criterio de una futura iteración.

- **R-01:** Textos de UI en inglés (`Loading projects…`, `New activity`, etc.) mientras `requirements.md` indica UI en español sin framework i18n — alinear copy en iteración de polish.
- **R-02:** Verificación visual en navegador no ejecutada en TEST (browser MCP no disponible); confirmar manualmente layout dashboard, contraste WCAG AA de `CpiSpiBadge` y gráfica Recharts.
- **R-03:** Entorno local: `npm ci` EPERM reportado por TEST; documentar workaround (`npm install`) o permisos Windows si persiste en CI.
- **R-04:** `ProjectSelector` no ordena explícitamente por `updated_at` descendente (RN-UI-09); depende del orden del API.
- **R-05:** Ampliar cobertura Vitest más allá del smoke de `CpiSpiBadge` (formulario actividad, `ErrorBanner` 422) según `design.md` §8.1 — opcional por spec.

---

## 7. Veredicto Final

**Veredicto:** `RECHAZADA`

La capa de presentación cumple el principio de **cero cálculo EVM en cliente** (RN-UI-01), el **contrato API de 10 endpoints** en módulos `api/`, el **dashboard de actividades** (REQ-06) con tabla, consolidados, gráfica PV/EV/AC y `CpiSpiBadge` accesible (RN-UI-02), además de build/Docker/nginx (REQ-12). Sin embargo, faltan flujos funcionales explícitos de **CRUD de proyectos** (H-01) y la **protección anti doble-submit en eliminación desde tabla** (H-02), ambos bloqueantes según `requirements.md`. IMPLEMENT debe corregir según los hallazgos H-01 y H-02 y solicitar re-auditoría (ciclo 2).

**Datos para error-report (D-02):**
| Hallazgo | Archivos clave | Acción esperada |
|:---|:---|:---|
| H-01 | `ProjectSelector.tsx`, `App.tsx` — ausencia de componentes proyecto | Añadir UI create/edit/delete proyecto consumiendo `api/projects.ts` |
| H-02 | `Dashboard.tsx` L112-129, `ActivitiesTable.tsx` L84-86 | Aplicar `useMutationWithLock`/`LoadingButton` o deshabilitar acciones durante DELETE |
