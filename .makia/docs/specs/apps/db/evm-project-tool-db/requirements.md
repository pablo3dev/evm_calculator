# Esquema de datos de EVM Project Tool

> Este documento es el **artefacto de aprobación del USUARIO**. Debe ser autosuficiente: todo lo necesario para aprobar el alcance, los objetivos y los criterios de éxito del spec está aquí, sin necesidad de leer `design.md` ni `tasks.md`.

- **Spec:** `evm-project-tool-db`

## Resumen

Esta unidad implementa el esquema PostgreSQL y las migraciones (`yoyo-migrations`) que persisten los datos de entrada de la herramienta EVM Project Tool: proyectos y sus actividades. No calcula ni valida reglas de negocio EVM — esa responsabilidad es 100% del backend (`evm-project-tool-backend`). Esta unidad solo garantiza tipos correctos, integridad referencial y migraciones aplicables de forma reproducible.

## Problema

Los líderes de proyecto necesitan una fuente de datos confiable y con integridad garantizada donde se registren los proyectos y actividades cuyo avance/costo alimentará el cálculo de indicadores de Valor Ganado (EVM). Sin un esquema de base de datos bien definido, con las relaciones y restricciones correctas, cualquier capa de negocio construida encima arriesga inconsistencia de datos (actividades huérfanas, tipos incorrectos, pérdida de trazabilidad temporal).

## Solución

- **En qué consiste:** un esquema PostgreSQL con 2 tablas (`projects`, `activities`) y sus migraciones SQL versionadas, aplicables de forma reproducible con `yoyo apply` en cualquier ambiente (desarrollo, CI, producción interna).
- **Cómo resuelve el problema:** garantiza que cada actividad pertenezca siempre a un proyecto existente (integridad referencial con borrado en cascada), que los campos numéricos de negocio (BAC, AC, porcentajes) tengan el tipo correcto para no perder precisión, y que el historial de creación/actualización quede registrado automáticamente (`created_at`/`updated_at`).

## Objetivos y criterios de éxito

- **Objetivo 1:** cualquier ambiente nuevo (desarrollo, CI, producción interna) puede levantar el esquema completo desde cero ejecutando las migraciones con `yoyo apply --batch`, sin pasos manuales adicionales.
- **Objetivo 2:** la integridad de los datos está garantizada a nivel de base de datos (no depende de que la capa de aplicación la respete): ninguna actividad puede existir sin un proyecto asociado, y al eliminar un proyecto se eliminan automáticamente sus actividades (cascada).

---

## Actores de negocio y flujo de valor

- **Líder de proyecto:** actor final que se beneficia indirectamente — sus datos de proyectos y actividades quedan almacenados de forma íntegra y consistente, base para que el backend calcule indicadores EVM confiables.
- **Desarrollador del backend (`evm-project-tool-backend`):** consumidor directo de este esquema — escribe SQL parametrizado directo (sin ORM) contra las tablas y columnas exactas que esta unidad define.

---

## Delimitación del Alcance (Scope Boundaries)

- **Dentro del Alcance (In Scope - Fase Actual):**
  - Tabla `projects`: `id` (UUID, PK, default `gen_random_uuid()`), `name` (obligatorio, no vacío a nivel de constraint NOT NULL), `description` (opcional), `created_at`/`updated_at` (timestamptz, default `now()`).
  - Tabla `activities`: `id` (UUID, PK, default `gen_random_uuid()`), `project_id` (UUID, FK a `projects.id`, `ON DELETE CASCADE`, obligatorio), `name` (obligatorio), `budget_at_completion` (numeric(14,2), obligatorio, restricción de no-negatividad a nivel de constraint CHECK), `planned_progress_percentage` (numeric(5,2), obligatorio, restricción de rango 0-100 a nivel de constraint CHECK), `actual_progress_percentage` (numeric(5,2), obligatorio, restricción de rango 0-100 a nivel de constraint CHECK), `actual_cost` (numeric(14,2), obligatorio, restricción de no-negatividad a nivel de constraint CHECK), `created_at`/`updated_at` (timestamptz, default `now()`), índice explícito en `project_id`.
  - Migraciones SQL puras con `yoyo-migrations` 9.0.0, aplicables con `yoyo apply --batch`.
  - PostgreSQL 18 (imagen Docker oficial `postgres:18`), tipos `UUID` con `gen_random_uuid()` nativo y `TIMESTAMPTZ`.
  - `lefthook.yml` en la raíz del repositorio (primera tarea de este spec, antes de cualquier tarea de esquema): cubre verificación de `apps/backend/` (ruff) y `apps/frontend/` (eslint/prettier).
- **Fuera del Alcance (Out of Scope / Non-Goals):**
  - Cualquier lógica de negocio o cálculo de indicadores EVM (responsabilidad exclusiva de `evm-project-tool-backend`).
  - Validación de reglas de negocio complejas más allá de constraints de esquema (p. ej. la interpretación textual de CPI/SPI, o cualquier regla que dependa de más de una fila) — eso vive en el backend.
  - ORM o capa de acceso a datos en código de aplicación (esta unidad es solo esquema/migraciones; el acceso SQL directo vía `psycopg` es responsabilidad de `evm-project-tool-backend`).
  - Persistencia de indicadores EVM calculados (PV, EV, CV, SV, CPI, SPI, EAC, VAC): se calculan en tiempo real, nunca se persisten.
  - Autenticación/autorización, multi-moneda, notificaciones.

---

## Reglas de Negocio y Políticas del Dominio

- **RN-01 [Integridad referencial obligatoria]:** toda fila de `activities` DEBE tener un `project_id` que referencie una fila existente de `projects`. Al eliminar un `project`, todas sus `activities` asociadas se eliminan automáticamente (borrado en cascada).
- **RN-02 [No negatividad de valores monetarios a nivel de esquema]:** `budget_at_completion` y `actual_cost` DEBEN ser mayores o iguales a cero, garantizado con un constraint `CHECK` a nivel de base de datos.
- **RN-03 [Rango válido de porcentajes a nivel de esquema]:** `planned_progress_percentage` y `actual_progress_percentage` DEBEN estar entre 0 y 100 inclusive, garantizado con un constraint `CHECK` a nivel de base de datos.
- **RN-04 [Nombre de proyecto obligatorio]:** `projects.name` no puede ser nulo, garantizado con un constraint `NOT NULL`.
- **RN-05 [Trazabilidad temporal automática]:** toda fila de `projects` y `activities` DEBE registrar automáticamente su fecha de creación (`created_at`) y de última actualización (`updated_at`), sin intervención de la capa de aplicación para el valor inicial.

---

## Requerimientos Funcionales y Criterios EARS

### REQ-01: Esquema de proyectos
- **Historia de Usuario:**
  - **Como:** desarrollador del backend.
  - **Quiero:** un esquema `projects` con integridad de datos garantizada.
  - **Para:** persistir proyectos sin riesgo de datos inconsistentes.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)
- **REQ-1.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` garantizar que toda fila de `projects` tenga un `id` UUID único generado automáticamente si no se provee.
- **REQ-1.2 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` se aplican las migraciones de esta unidad con `yoyo apply --batch` sobre una base de datos PostgreSQL 18 vacía
  - `EL SISTEMA DEBE` crear la tabla `projects` con todas sus columnas, tipos y constraints definidos en el alcance.
- **REQ-1.3 (Excepción o Manejo de Invalidez):**
  - `SI` se intenta insertar una fila en `projects` con `name` nulo
  - `EL SISTEMA DEBE` rechazar la operación a nivel de base de datos (constraint `NOT NULL`).

### REQ-02: Esquema de actividades
- **Historia de Usuario:**
  - **Como:** desarrollador del backend.
  - **Quiero:** un esquema `activities` con integridad referencial y constraints de rango/no-negatividad garantizados.
  - **Para:** persistir actividades sin riesgo de datos huérfanos o fuera de rango.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)
- **REQ-2.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` garantizar que toda fila de `activities` tenga un `project_id` que referencie una fila existente de `projects`.
- **REQ-2.2 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` se elimina una fila de `projects` que tiene actividades asociadas
  - `EL SISTEMA DEBE` eliminar automáticamente todas las filas de `activities` asociadas (cascada), sin intervención de la capa de aplicación.
- **REQ-2.3 (Excepción o Manejo de Invalidez):**
  - `SI` se intenta insertar o actualizar una fila de `activities` con `budget_at_completion` o `actual_cost` negativos
  - `EL SISTEMA DEBE` rechazar la operación a nivel de base de datos (constraint `CHECK`).
- **REQ-2.4 (Excepción o Manejo de Invalidez):**
  - `SI` se intenta insertar o actualizar una fila de `activities` con `planned_progress_percentage` o `actual_progress_percentage` fuera del rango 0-100
  - `EL SISTEMA DEBE` rechazar la operación a nivel de base de datos (constraint `CHECK`).
- **REQ-2.5 (Excepción o Manejo de Invalidez):**
  - `SI` se intenta insertar una fila de `activities` con un `project_id` que no existe en `projects`
  - `EL SISTEMA DEBE` rechazar la operación a nivel de base de datos (constraint de clave foránea).

### REQ-03: Migraciones reproducibles
- **Historia de Usuario:**
  - **Como:** desarrollador del backend/infraestructura.
  - **Quiero:** migraciones SQL versionadas y reproducibles.
  - **Para:** levantar el esquema completo en cualquier ambiente nuevo sin pasos manuales.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)
- **REQ-3.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` proveer todas las migraciones como archivos SQL puros compatibles con `yoyo-migrations` 9.0.0, aplicables con `yoyo apply --batch`.
- **REQ-3.2 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` se ejecutan las migraciones sobre una base de datos PostgreSQL 18 vacía
  - `EL SISTEMA DEBE` dejar el esquema completo (`projects`, `activities`, índice en `project_id`, todos los constraints) listo para uso, sin errores.

### REQ-04: Verificación local (lefthook)
- **Historia de Usuario:**
  - **Como:** desarrollador del proyecto.
  - **Quiero:** verificación local automática antes de cada commit.
  - **Para:** detectar errores de lint/formato antes de subir cambios.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)
- **REQ-4.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` proveer un `lefthook.yml` en la raíz del repositorio con verificación pre-commit de `apps/backend/` (ruff check + ruff format) y `apps/frontend/` (eslint + prettier), listo para instalar con `lefthook install`.

---

## Edge Cases & Boundary Conditions
| ID | Escenario / Condición Límite | Comportamiento Esperado del Sistema |
|:---|:---|:---|
| **EC-01** | Inserción de `activities` con `project_id` inexistente | Rechazo a nivel de base de datos por violación de clave foránea, sin crear el registro. |
| **EC-02** | Eliminación de un `project` con actividades asociadas | Todas las `activities` asociadas se eliminan automáticamente (cascada), sin dejar registros huérfanos. |
| **EC-03** | Inserción de `activities` con porcentaje de avance negativo o mayor a 100 | Rechazo a nivel de base de datos por violación de constraint `CHECK`. |
| **EC-04** | Inserción de `activities` con `budget_at_completion` o `actual_cost` negativos | Rechazo a nivel de base de datos por violación de constraint `CHECK`. |
| **EC-05** | Aplicación de migraciones sobre base de datos ya migrada (re-ejecución) | `yoyo apply --batch` es idempotente: no re-aplica migraciones ya aplicadas, no falla. |

---

## Restricciones Operativas y de Cumplimiento (Nivel Negocio)
- **Tiempo de Respuesta Operativo (SLA de Usuario):** no aplica un SLA específico a nivel de esquema (las migraciones corren una sola vez por ambiente, no en el camino crítico de una petición de usuario).
- **Privacidad y Cumplimiento Normativo:** no se almacenan datos personales sensibles en `projects`/`activities` (solo datos de proyecto y actividad, sin PII).
- **Continuidad de Negocio:** las migraciones deben ser reproducibles de forma determinista en cualquier ambiente nuevo (desarrollo, CI, producción interna), sin pasos manuales ni intervención humana más allá de ejecutar el comando `yoyo apply --batch`.

---

> **Reglas de redacción:** este documento habla el lenguaje del negocio y del stakeholder; evita el detalle de implementación que corresponde a `design.md` (contratos de API, esquemas de datos, código concreto). Esta unidad SÍ nombra archivos, rutas y tablas del dominio `apps/db/` porque ese es su dominio funcional (persistencia). Los nombres de sintaxis (`REQ`, `RN`, `EC`) se mantienen en inglés por estándar; todo el contenido se redacta en español.
