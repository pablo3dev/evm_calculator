# Audit Report: evm-project-tool-db

## 1. Metadata
- **Spec Auditado:** `evm-project-tool-db`
- **Ruta:** `.makia/docs/specs/apps/db/evm-project-tool-db`
- **Fecha de Auditoría:** `2026-09-11`
- **Auditor:** `AUDIT`
- **Ciclo de Auditoría:** `1`

---

## 2. Alcance de la Verificación
- [x] El código implementado cumple con `requirements.md` (criterios EARS) y `design.md` (contratos, estructura de archivos).
- [x] El spec (`requirements.md`/`design.md`) está alineado con `domain-model.md` (lenguaje ubicuo, límites del Contexto Delimitado, entidades y reglas de negocio).

---

## 3. Hallazgos y Desviaciones
| ID | Descripción | Severidad | Referencia (REQ/DESIGN/domain-model) |
|:---|:---|:---:|:---|
| — | Sin hallazgos | — | — |

---

## 4. Supuestos Detectados
> Afirmaciones o decisiones tomadas por IMPLEMENT/SPEC sin respaldo explícito en el spec o en `domain-model.md`.

- `requirements.md` (alcance) describe `projects.name` como «no vacío a nivel de constraint NOT NULL»; `NOT NULL` solo rechaza `NULL`, no cadenas vacías (`''`). El DDL implementado coincide con `design.md` §3.2 (`name VARCHAR NOT NULL`), sin `CHECK` adicional. La validación de nombre no vacío, si se exige en negocio, queda en `evm-project-tool-backend`.
- `updated_at` no tiene trigger de auto-actualización en `UPDATE`; `design.md` §3.2 lo documenta explícitamente como fuera de alcance de esta unidad. `requirements.md` RN-05 exige valor inicial automático (`DEFAULT now()`), cumplido en ambas tablas.

---

## 5. Preguntas Abiertas
- Sin preguntas abiertas.

---

## 6. Recomendaciones
> Mejoras sugeridas que **no** son bloqueantes — no afectan negocio ni funcionalidad, quedan a criterio de una futura iteración.

- Sin recomendaciones.

---

## 7. Veredicto Final

**Veredicto:** `PASA`

### Resumen de contraste

| Área | Resultado |
|:---|:---|
| DDL `0001_create_projects_table.sql` vs `design.md` §3.2 / `db-design.dbml` | Coincidencia exacta: `id` UUID PK `gen_random_uuid()`, `name` NOT NULL, `description` TEXT, `created_at`/`updated_at` TIMESTAMPTZ DEFAULT `now()`. |
| DDL `0002_create_activities_table.sql` vs `design.md` §3.2 / `db-design.dbml` | Coincidencia exacta: FK `project_id` → `projects(id) ON DELETE CASCADE`, constraints `CHECK` de no-negatividad (BAC, AC) y rango 0–100 (porcentajes), índice `idx_activities_project_id`. |
| Persistencia vs `domain-model.md` (apps/backend) | `Project` e `Activity` materializados con snake_case estándar; `EvmIndicatorSet` no persistido (decisión cerrada). RN-10/RN-11 del dominio reflejadas en constraints de esquema (RN-02/RN-03 del spec DB). |
| Estructura de archivos vs `design.md` §5 | `lefthook.yml`, `apps/db/.gitignore`, migraciones `0001`/`0002` con rollback SQL presentes. |
| REQ-4.1 (`lefthook.yml`) | Sección `pre-commit` con `backend-lint`, `backend-format`, `frontend-lint`, `frontend-format` sobre plantilla MakIA con `commit-msg` intacto. |
| Edge cases EC-01..05 | Validados por TEST (suite completa PASS): FK inválida, cascada, CHECK porcentajes/monetarios, idempotencia `yoyo apply --batch`. |

Esta unidad no implementa cálculo EVM ni lógica de negocio de backend; la auditoría no exige comportamiento fuera de persistencia/integridad referencial.
