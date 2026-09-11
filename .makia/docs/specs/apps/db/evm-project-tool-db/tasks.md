# Implementation Tasks: EVM Project Tool DB

## 1. Metadata & Traceability
- **Spec:** `evm-project-tool-db`
- **Requirements Ref:** `requirements.md` (spec: `evm-project-tool-db`)
- **Design Ref:** `design.md` (spec: `evm-project-tool-db`)

`[P]`: puede ejecutarse en paralelo (archivos distintos, sin dependencias).

---

## 2. Execution Guidelines
- **Sequential Ordering:** ejecutar las fases en orden estricto; dentro de cada fase, las subtareas atómicas se completan antes de pasar a la siguiente.
- **Test-Verified:** cada funcionalidad debe tener su prueba correspondiente antes de marcarse `[x]`.
- **Traceability Tags:** cada tarea referencia su origen en `requirements.md` (ej. `[REQ-1.1]`) y su componente en `design.md` (ej. `[DESIGN §5]`).

---

## 3. Phase Breakdown & Actionable Tasks

### Fase 1: Configuración de verificación local (lefthook)
- [ ] **Tarea 1.1: Crear `lefthook.yml` en la raíz del repositorio** `[REQ-4.1]` `[DESIGN §5]` — copiar la plantilla base `.makia/core/harness/templates/lefthook.example.yml` a `lefthook.yml` en la raíz, agregando la sección `pre-commit` con los comandos `backend-lint`, `backend-format`, `frontend-lint`, `frontend-format` exactamente como están cerrados en `design.md` §2.5 (heredado de `draft.md` de IDEA) — sin modificar la sección `commit-msg` ya provista por la plantilla.

### Fase 2: Esquema y migraciones de `projects`
- [ ] **Tarea 2.1: [P] Migración `0001_create_projects_table.sql`** `[REQ-1.1, REQ-1.2, REQ-1.3]` `[DESIGN §3.2]` — crear la migración de `yoyo-migrations` 9.0.0 (verificar convención exacta de archivo de yoyo 9.0.2 al momento de implementar) que crea la tabla `projects` con el DDL exacto de `design.md` §3.2 (columnas `id`, `name`, `description`, `created_at`, `updated_at`, constraint `NOT NULL` en `name`).
- [ ] **Tarea 2.2: Verificar aplicación de la migración `0001`** `[REQ-1.2]` `[DESIGN §8.2]` — aplicar `yoyo apply --batch` sobre una base de datos PostgreSQL 18 vacía y confirmar que la tabla `projects` queda creada con todos sus constraints, sin error.

### Fase 3: Esquema y migraciones de `activities`
- [ ] **Tarea 3.1: Migración `0002_create_activities_table.sql`** `[REQ-2.1, REQ-2.3, REQ-2.4, REQ-2.5]` `[DESIGN §3.2]` — crear la migración que crea la tabla `activities` con el DDL exacto de `design.md` §3.2 (columnas `id`, `project_id` con FK `ON DELETE CASCADE`, `name`, `budget_at_completion`, `planned_progress_percentage`, `actual_progress_percentage`, `actual_cost`, `created_at`, `updated_at`, constraints `CHECK` de rango 0-100 y de no-negatividad, índice en `project_id`). Depende de que la Tarea 2.1 exista (orden secuencial `0001` antes de `0002`).
- [ ] **Tarea 3.2: Verificar aplicación de la migración `0002` y constraints** `[REQ-2.2, EC-01, EC-02, EC-03, EC-04]` `[DESIGN §8.2]` — aplicar `yoyo apply --batch` en secuencia sobre la base de datos con `0001` ya aplicada, y verificar manualmente (consultas SQL directas) que: (a) insertar una `activity` con `project_id` inexistente es rechazado (EC-01), (b) eliminar un `project` con actividades asociadas elimina esas actividades en cascada (EC-02), (c) insertar una `activity` con porcentaje fuera de rango 0-100 es rechazado (EC-03), (d) insertar una `activity` con `budget_at_completion`/`actual_cost` negativo es rechazado (EC-04).

### Fase 4: Verificación de integridad referencial y documentación
- [ ] **Tarea 4.1: Re-ejecución idempotente de migraciones** `[EC-05]` `[DESIGN §8.2]` — ejecutar `yoyo apply --batch` una segunda vez sobre la base de datos ya migrada y confirmar que no falla ni re-aplica migraciones ya aplicadas.
- [ ] **Tarea 4.2: `apps/db/.gitignore` y documentación mínima** `[DESIGN §5]` — crear `apps/db/.gitignore` con las entradas propias de `yoyo-migrations` (caché/estado local si aplica), sin documentación en prosa adicional fuera de lo que este spec ya define (esta unidad no requiere `README.md` propio — el `README.md` general del proyecto, con comandos de ejecución, es responsabilidad transversal fuera del alcance de esta unidad).

---

## 4. Execution Progress Tracker
| Fase | Total Tareas | Completadas | Estado |
|:---|:---:|:---:|:---|
| Fase 1: Configuración de verificación local (lefthook) | 1 | 0 | `Pending` |
| Fase 2: Esquema y migraciones de `projects` | 2 | 0 | `Pending` |
| Fase 3: Esquema y migraciones de `activities` | 2 | 0 | `Pending` |
| Fase 4: Verificación de integridad referencial y documentación | 2 | 0 | `Pending` |
| **Total Global** | **7** | **0** | **0%** |

---

## 5. Definition of Done (DoD) Gate
- [ ] Todas las tareas están marcadas como completadas (`[x]`).
- [ ] Todos los criterios EARS de `requirements.md` pasan las pruebas asociadas.
- [ ] La estructura de archivos coincide con el mapeo de `design.md`.
- [ ] Todos los tests unitarios, de integración y E2E pasan sin advertencias críticas.
- [ ] La fila del spec en el `INDEX.md` de specs (`.makia/docs/specs/<categoría>/INDEX.md`) está sincronizada con el `Estado global` de `summary.md`.

---

> IMPLEMENT ejecuta este documento tarea por tarea. Cada tarea se valida con un TEST acotado a sus propios archivos (no la suite completa) antes de marcarse `[x]`. Máximo 2 iteraciones de corrección por tarea antes de cancelar y escalar (ver sub-orchestrator.md del Orquestador).
