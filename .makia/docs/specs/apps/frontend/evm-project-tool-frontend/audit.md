# Audit Report: evm-project-tool-frontend

## 1. Metadata
- **Spec Auditado:** `evm-project-tool-frontend`
- **Ruta:** `.makia/docs/specs/apps/frontend/evm-project-tool-frontend`
- **Fecha de Auditoría:** `2026-09-11`
- **Auditor:** `AUDIT`
- **Ciclo de Auditoría:** `3`

---

## 2. Alcance de la Verificación
- [x] El código implementado cumple con `requirements.md` (criterios EARS) y `design.md` (contratos, estructura de archivos).
- [x] El spec (`requirements.md`/`design.md`) está alineado con `domain-model.md` (lenguaje ubicuo, límites del Contexto Delimitado, entidades y reglas de negocio) — el frontend no es dueño del dominio; consume el contrato REST del backend sin duplicar entidades ni calcular EVM.

**Fuentes contrastadas:**
- `../../backend/domain-model.md` — indicadores EVM e interpretaciones CPI/SPI se calculan en backend; UI solo presenta.
- `requirements.md` — RN-UI-01..RN-UI-13, REQ-01..REQ-15, EC-01..EC-15
- `design.md` — i18n §2.7, Tooltip §2.8, LanguageSwitcher §2.9, interpretación local §2.7.6, footprint §5, checklist §9
- `tasks.md` / `summary.md` — Fase 5 7/7 `[x]`; IMPLEMENT 21/21
- Código: `apps/frontend/src/` (HEAD `88df493`)
- Evidencia TEST (informada por Orquestador; AUDIT no reejecutó la suite): ver subsección siguiente

### Evidencia TEST global (informada por Orquestador)

HEAD: `88df49344df8b9f0bf36ad05a2f641c465b0ab32` — veredicto TEST **PASA**.

| Comando / escenario | Resultado |
|:---|:---|
| `npm run test` | exit 0 — 4/4 Vitest (`CpiSpiBadge`, `Tooltip`, `LanguageSwitcher`, `evmIndicatorsCatalog`) |
| `npm run lint` | exit 0 |
| `npx prettier --check .` | exit 0 |
| `npm run build` | exit 0 |
| Browser / EC-13 / EC-14 / EC-15 | **no ejecutado** (backend `localhost:8000` timeout; MCP browser sin pestaña) |
| Warning no bloqueante | chunk JS > 500 kB |

La no ejecución de browser y de EC-13/14/15 **no es bloqueante**: `tasks.md` Tarea 5.6 y `requirements.md` marcan esos escenarios como verificación manual opcional (sin umbral de cobertura frontend). Quedan como recomendaciones (R-02, R-06).

**Verificaciones de negocio UI (muestreo representativo):**

| Regla / REQ | Evidencia en código | Resultado |
|:---|:---|:---:|
| RN-UI-01 | Sin fórmulas PV/EV/CPI/SPI/EAC/VAC ejecutadas en cliente; `PvEvAcChart` lee `indicators.pv`/`ev` y `actual_cost`; catálogo solo guarda fórmulas como texto | OK |
| RN-UI-02 / REQ-08 | `CpiSpiBadge.tsx`: color + ícono SVG + texto `t(evmInterpretation.*)` + `aria-label` + `role="status"` | OK |
| RN-UI-03 / REQ-09 | `ProjectFormModal`, `ActivityFormModal`, `Dashboard.handleDeleteFromTable` con `useMutationWithLock` + `LoadingButton`; `actionsDisabled={isLocked}` | OK |
| RN-UI-04 | `ActivityFormModal`: `type="number"` con `min`/`max` en BAC, AC y porcentajes | OK |
| RN-UI-05 / REQ-10 | `ErrorBanner` + `ApiError` 422/404; mensajes de red vía `t('common.errorNetwork')` | OK |
| RN-UI-06 / REQ-06 | `Dashboard.refetch()` tras mutaciones; dashboard orquesta tabla, consolidados, gráfica y CRUD | OK |
| RN-UI-07 / EC-01/02 | `formatDisplay.ts`: `MISSING_VALUE = 'N/A'`; interpretación local si CPI/SPI null | OK |
| RN-UI-08 | Tipos y payloads snake_case (`types/api.ts`, `api/client.ts`) | OK |
| RN-UI-09 | `ProjectSelector.sortProjects`: `updated_at` descendente | OK |
| RN-UI-10 / REQ-13 | `LanguageSwitcher` ES\|EN visible en cabecera `App.tsx`; `I18nProvider` persiste `sessionStorage['evm_locale']`; `setLocale` re-render sin reload; fallback `navigator.language` → `en` (EC-15 en código) | OK |
| RN-UI-11 / REQ-15 | `evmIndicatorsCatalog.ts`: `code` invariable; patrón `SIGLA — nombre` en tabla, consolidados, badges y leyenda Recharts | OK |
| RN-UI-12 / REQ-14 | `Tooltip.tsx`: hover + foco, Escape, `role="tooltip"`, `aria-describedby` + `useId()` | OK (limitación Recharts en hover de barras: R-07) |
| RN-UI-13 / REQ-07 | `evmInterpretation.ts` `getCpiInterpretationKey`/`getSpiInterpretationKey`; componentes no leen `cpi_interpretation`/`spi_interpretation` (solo existen en `types/api.ts`) | OK |
| Contrato 10 endpoints | `api/projects.ts` (5) + `api/activities.ts` (5) | OK |
| REQ-01..REQ-12 | CRUD proyectos/actividades, dashboard, Docker, tipos — sin regresiones respecto al ciclo 2 | OK |
| REQ-13/14/15 | Selector, tooltips, sigla + nombre localizado | OK |
| Strings vía `t()` | Componentes de UI usan `useI18n().t()`; siglas y catálogo EVM fuera del `Dictionary` según §2.7.3 | OK |

---

## 3. Hallazgos y Desviaciones

H-01 (ciclo 1, resuelto): CRUD de proyectos en `ProjectFormModal`/`ProjectSelector`.
H-02 (ciclo 1, resuelto): anti doble-submit en delete desde `ActivitiesTable` (`useMutationWithLock`).
H-03 (ciclo 1, resuelto): listado de proyectos con descripción y fechas.
H-04 (ciclo 1, resuelto): nulls numéricos como `N/A` en `formatDisplay.ts`.

### Ciclo 3 — nuevos hallazgos

| ID | Descripción | Severidad | Referencia (REQ/DESIGN/domain-model) |
|:---|:---|:---:|:---|
| — | Sin hallazgos bloqueantes ni menores nuevos | — | — |

---

## 4. Supuestos Detectados
Sin supuestos que alteren el negocio. Notas de implementación alineadas con `design.md` (no con el texto más rígido de `tasks.md` Tarea 5.2):

- `Tooltip` usa `useI18n().locale` internamente para elegir `nameEs`/`nameEn`, tal como cierra `design.md` §2.8 (la Tarea 5.2 decía no invocar `useI18n` dentro del componente).
- `I18nProvider` envuelve el árbol en `main.tsx` (equivalente funcional a `App.tsx` §2.7.4).
- `LanguageSwitcher` vive en la barra del título (`h1`), no en la misma fila que `ProjectSelector`; sigue visible en todas las pantallas (CA-13.1).

---

## 5. Preguntas Abiertas
Sin preguntas abiertas.

---

## 6. Recomendaciones
> Mejoras sugeridas que **no** son bloqueantes — no afectan negocio ni funcionalidad, quedan a criterio de una futura iteración.

R-01 (ciclo 2, resuelto): UI localizada ES/EN vía `t()` y catálogo i18n (Fase 5, RN-UI-10 / REQ-13).

- **R-02:** Verificación visual en navegador no ejecutada en TEST de este ciclo (MCP browser sin pestaña / backend local timeout). Confirmar manualmente layout, contraste WCAG AA de `CpiSpiBadge` y gráfica Recharts. No bloquea: spec no exige E2E de esta unidad.
- **R-03:** Entorno local: `npm ci` EPERM reportado en un TEST anterior; no revalidado en este ciclo. Documentar workaround si persiste en CI.
- **R-05 (ciclo 2, parcialmente resuelto):** Vitest cubre ahora 4 humos (badge, Tooltip, LanguageSwitcher, catálogo). Siguen opcionales los casos de `ActivityFormModal` / `ErrorBanner` 422 de `design.md` §8.1.
- **R-06:** EC-13 / EC-14 / EC-15 no ejecutados en TEST (formulario abierto al cambiar idioma; tooltip con valor null; fallback `navigator.language` distinto de es/en). El código cubre EC-14 (tooltip independiente del valor) y EC-15 (`detectInitialLocale` → `'en'`). Ejecutar los tres de forma manual cuando haya browser; no son gate de AUDIT.
- **R-07:** Tooltip nativo de Recharts al hover de barras usa texto plano `"SIGLA — Nombre"` (limitación de tipos documentada en `PvEvAcChart.tsx` y `summary.md`). La leyenda sí usa el `Tooltip` reutilizable. Aceptado; no exige corrección.

Nota de spec (no código): RN-UI-12 / CA-14.2 piden nombre ES y EN simultáneos en el tooltip; `design.md` §2.8 cierra mostrar un solo nombre según locale. IMPLEMENT siguió el design. Si se desea ambos nombres a la vez, es un ajuste de spec, no un defecto de negocio actual.

---

## 7. Veredicto Final

**Veredicto:** `PASA_CON_OBSERVACIONES`

La Fase 5 (i18n, Tooltip, LanguageSwitcher, interpretación local CPI/SPI) está aplicada en código de forma alineada con RN-UI-10..13 y REQ-13..15, sin romper RN-UI-01..09 / REQ-01..12. El frontend sigue siendo presentación pura: no calcula EVM y no usa `cpi_interpretation`/`spi_interpretation` del API para mostrar texto. Los 10 endpoints REST y los tipos snake_case permanecen intactos.

No hay hallazgos bloqueantes (D-02 no aplica). Las observaciones abiertas (R-02, R-06 principalmente) se resuelven con verificación manual opcional, no corrigiendo código (D-03 no aplica).

**Hallazgos ciclo 1 (cerrados, referencia):**

| Hallazgo ciclo 1 | Estado | Commits de corrección (ciclo 1) |
|:---|:---|:---|
| H-01 | Cerrado | `0d40b4d` |
| H-02 | Cerrado | `100c766` |
| H-03 | Cerrado | `0d40b4d` |
| H-04 | Cerrado | `56e23e4` |
