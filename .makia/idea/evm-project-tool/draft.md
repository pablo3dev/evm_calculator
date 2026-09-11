# EVM Project Tool — Registro de avance y cálculo de indicadores de Valor Ganado (EVM/PMI)

> Instrucciones para el LLM implementador: este documento contiene todo el contexto,
> las decisiones y las especificaciones necesarias para implementar esta funcionalidad
> de principio a fin. No asumas, no inventes ni deduzcas nada que no esté aquí. Si existe
> un archivo `db-design.dbml` junto a este documento, es el diseño de base de datos
> obligatorio a seguir. Sigue el stack y la arquitectura indicados exactamente como se
> describen.

## Resumen ejecutivo

Herramienta interna fullstack para que líderes de proyecto registren el avance de actividades de un proyecto y visualicen en tiempo real los indicadores de Valor Ganado (EVM, estándar PMI): PV, EV, CV, SV, CPI, SPI, EAC y VAC, por actividad y consolidados por proyecto, con interpretación textual automática de CPI/SPI. El backend concentra toda la lógica de negocio y validaciones; el frontend es capa de presentación pura; la base de datos persiste únicamente los datos de entrada (no los indicadores calculados); la infraestructura orquesta las tres capas con un solo comando Docker Compose.

## Contexto

Clasificación explícita: **app nueva, capacidad multi-unidad**. No es "app completa / multi-feature" (no aplica el eje por feature — ver test de alcance abajo). Es la primera capacidad de negocio de este proyecto (`evm_calculator`), que nace sin `domain-model.md` previo — contexto delimitado nuevo.

Test de alcance aplicado por IDEA (RN-01/RN-02): se identificó 1 sola capacidad candidata — "registro de avance y cálculo de indicadores EVM de un proyecto" — que pasa el test RN-01 (problema específico y describible en una frase: "los líderes de proyecto no pueden ver en tiempo real si su proyecto va bien o mal en costo y cronograma"; porción vertical completa con actor propio — líder de proyecto — y flujo de punta a punta: crear proyecto → crear/editar actividades → registrar avance/costo → ver indicadores calculados; resumen ejecutivo propio sin enumerar capacidades no relacionadas). No existen otras capacidades candidatas separables: el CRUD de proyectos/actividades no es una feature independiente, es el mismo flujo de valor que alimenta el cálculo EVM. Por tanto **N = 1** — sin descomposición por el eje "app completa / multi-feature".

Test de multi-unidad aplicado por IDEA (RN-04): realizar esta capacidad obliga a escribir código en 4 unidades con límites de despliegue, propiedad y responsabilidad distintos, ya fijados por el propio alcance de la idea: `apps/db` (esquema y migraciones PostgreSQL), `apps/backend` (API REST, toda la lógica y validaciones de negocio, dueño del dominio), `apps/frontend` (dashboard, presentación pura, cero lógica de negocio), `apps/infrastructure` (orquestación Docker Compose de las 3 anteriores). Contraprueba: mover todo el código a una sola unidad rompería fronteras de responsabilidad ya explícitas en el alcance ("el backend no debe delegar ni asumir la lógica de negocio al frontend"; "el frontend no debe tener reglas ni lógica de negocio, solo captura/envía/recibe/pinta datos"), además de la separación física real de contenedores Docker por app. Por tanto **es multi-unidad** — activa el eje "por unidad de código" de la sección "Descomposición en specs", aunque N=1.

## Descomposición en specs

| # | Spec (slug) | Unidad de código | Responsabilidad | Resumen | Depende de | Grupo de paralelismo (provisional) |
|---|---|---|---|---|---|---|
| 1 | `evm-project-tool-db` | `apps/db/` | Esquema PostgreSQL y migraciones (yoyo-migrations). Persiste `projects` y `activities` según `db-design.dbml`. | Diseño de tablas, tipos `UUID`/`timestamptz`, constraints de integridad y migraciones SQL puras aplicables con `yoyo apply`. | — | A |
| 2 | `evm-project-tool-backend` | `apps/backend/` | API REST (FastAPI) y TODA la lógica de negocio: CRUD de proyectos/actividades, cálculo de indicadores EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC) e interpretación textual de CPI/SPI. Dueño del dominio (`domain-model.md`). | CRUD + motor de cálculo EVM sin ORM, SQL directo contra el esquema de `evm-project-tool-db`, expuesto vía OpenAPI/Swagger. | `evm-project-tool-db` | B |
| 3 | `evm-project-tool-frontend` | `apps/frontend/` | Dashboard React+TS: captura y edición de actividades, tabla de indicadores por actividad, indicadores consolidados, indicación visual de estado CPI/SPI, gráfica PV/EV/AC por actividad. Cero lógica de negocio: solo consume el contrato REST de `evm-project-tool-backend`. | Presentación pura sobre el contrato OpenAPI del backend. | `evm-project-tool-backend` | C |
| 4 | `evm-project-tool-infrastructure` | `apps/infrastructure/` | `docker-compose`/`compose.yaml` que levanta DB + migraciones + backend + frontend con un solo comando, en primer arranque y en arranques posteriores, con orden de arranque garantizado vía healthchecks. | Orquestación end-to-end de las 3 unidades anteriores. | `evm-project-tool-backend`, `evm-project-tool-frontend` | D |

### Orden de creación (SPEC crea en este orden exacto, uno a la vez)

1. `evm-project-tool-db`
2. `evm-project-tool-backend`
3. `evm-project-tool-frontend`
4. `evm-project-tool-infrastructure`

### Grupos de paralelismo (provisional, IDEA)

- **Grupo A** (`evm-project-tool-db`): sin dependencias, punto de partida — el esquema debe existir antes de que el backend pueda escribir SQL contra él.
- **Grupo B** (`evm-project-tool-backend`): depende de Grupo A (necesita el esquema real de `db-design.dbml`/migraciones para escribir SQL directo, sin ORM).
- **Grupo C** (`evm-project-tool-frontend`): depende de Grupo B (necesita el contrato OpenAPI real del backend — endpoints, esquemas de request/response — para implementar la capa de presentación sin inventar el contrato). SPEC puede reevaluar si el contrato queda cerrado en `design.md` de `evm-project-tool-backend` antes de que termine su implementación completa, permitiendo solapar C con la cola de B — decisión de paralelismo real que corresponde confirmar a SPEC con el footprint de archivos, no a IDEA.
- **Grupo D** (`evm-project-tool-infrastructure`): depende de Grupo B y Grupo C (el `docker-compose` orquesta las 3 imágenes/servicios ya definidos; necesita conocer puertos, variables de entorno y comandos de arranque reales de cada unidad).

### Unidades de código de la capacidad (solo eje multi-unidad)

| Unidad | Id / path de código | Tipo de unidad | Responsabilidad | ¿Contexto Delimitado propio? |
|---|---|---|---|---|
| `db` | `apps/db/` | app (persistencia) | Esquema y migraciones PostgreSQL | No (usa el domain-model.md de `backend`) |
| `backend` | `apps/backend/` | app (servicio API) | Lógica de negocio, validaciones y cálculo EVM completo; dueño del dominio | Sí — dueño del `domain-model.md` único de esta capacidad |
| `frontend` | `apps/frontend/` | app (presentación) | Dashboard, captura/envío/recepción/pintado de datos | No (usa el domain-model.md de `backend`) |
| `infrastructure` | `apps/infrastructure/` | app (orquestación) | `docker-compose` de arranque único de todo el sistema | No (usa el domain-model.md de `backend`) |

### `domain-model.md` de la capacidad (solo eje multi-unidad)

- Unidad dueña del dominio: `backend` (`apps/backend/`) — es quien concentra toda la lógica de negocio y las validaciones EVM, por regla explícita del alcance de la idea.
- Ruta del `domain-model.md` único: `.makia/docs/specs/apps/backend/domain-model.md`.
- Las demás unidades (`db`, `frontend`, `infrastructure`) NO crean su propio `domain-model.md`: sus specs lo referencian por ruta relativa dentro de `.makia/docs/`. Ninguna de ellas es un Contexto Delimitado propio: `db` es pura persistencia sin reglas de negocio, `frontend` es pura presentación sin reglas de negocio, `infrastructure` es pura orquestación.

## Problema

Los líderes de proyecto necesitan saber, en tiempo real, si su proyecto va bien o mal en términos de costo y cronograma. No basta con saber cuánto se ha gastado o cuánto se ha avanzado por separado — lo relevante es la relación entre ambos (p. ej. haber gastado 60% del presupuesto habiendo completado solo 40% del trabajo es una señal de alerta). Hoy no existe una herramienta interna que capture el avance de actividades y traduzca esos datos en los indicadores estándar de Valor Ganado (PMI) de forma automática y visual.

## Solución propuesta

Una aplicación fullstack donde el líder de proyecto crea proyectos y sus actividades (cada una con nombre, BAC, % de avance planificado a la fecha de corte, % de avance real y AC), y el sistema calcula automáticamente, sin intervención manual, los 8 indicadores EVM por actividad y consolidados por proyecto, junto con una interpretación textual de CPI y SPI (bajo/sobre presupuesto, adelantado/atrasado). El frontend presenta esto en un dashboard visual con tabla de actividades, indicadores consolidados, indicación visual de estado, y una gráfica comparativa PV/EV/AC por actividad.

## Alcance

- **Dentro del alcance:**
  - CRUD completo de proyectos (crear, editar, eliminar).
  - CRUD completo de actividades de un proyecto (crear, editar, eliminar), con los 4 campos de entrada: nombre, BAC, % avance planificado, % avance real, AC.
  - Cálculo automático (en tiempo real, en cada lectura, sin persistir el resultado) de PV, EV, CV, SV, CPI, SPI, EAC, VAC por actividad.
  - Cálculo automático de los mismos 8 indicadores consolidados a nivel de proyecto (agregación de las actividades del proyecto).
  - Interpretación textual automática de CPI y SPI (bajo/sobre presupuesto; adelantado/atrasado/en tiempo).
  - Dashboard: tabla de actividades con indicadores, indicadores consolidados del proyecto, indicación visual (color/ícono) del estado de CPI/SPI, gráfica comparativa PV/EV/AC por actividad.
  - Documentación OpenAPI/Swagger accesible localmente en `/api-docs` o `/swagger-ui`.
  - `docker-compose` único que levanta DB + migraciones + backend + frontend, en primer arranque y en arranques posteriores.
  - Cobertura de tests: ≥80% en la capa de negocio (incluyendo bordes AC=0, sin actividades, avance real=0), al menos 1 test de integración por endpoint.
  - `README.md` con comandos de ejecución y de test.
- **Fuera del alcance (non-goals):**
  - Persistencia histórica o de tendencia de los indicadores EVM (no existe tabla de snapshots; los indicadores se calculan al vuelo, no se versionan en el tiempo). Si se necesita en el futuro, es una idea nueva.
  - Autenticación/autorización de usuarios (no se especificó ningún requerimiento de login, roles ni multiusuario — herramienta interna de un solo nivel de acceso).
  - Modelos de pronóstico EAC alternativos (tasa atípica, combinado costo-cronograma) y TCPI/ETC — el alcance solo pide EAC por el modelo de "tasa típica" (`BAC / CPI`) y VAC; el resto del glosario del lenguaje ubicuo (TCPI, ETC, Control Account, Work Package, líneas base formales, eventos de dominio) es contexto conceptual, no requerimiento funcional de esta idea.
  - Multi-moneda (`MonetaryAmount` del lenguaje ubicuo se simplifica a un valor numérico decimal sin moneda explícita, dado que no se especificó ese requerimiento).
  - Notificaciones o alertas automáticas al cruzar umbrales de CPI/SPI (el evento de dominio `CostVarianceThresholdExceeded`/`ScheduleVarianceThresholdExceeded` del lenguaje ubicuo no tiene requerimiento funcional asociado en esta idea, más allá de la interpretación textual en la respuesta del API).

## Actores y flujo de valor

- **Líder de proyecto:** único actor. Obtiene valor al registrar avance y costo de sus actividades y ver, sin cálculo manual, si su proyecto está bajo/sobre presupuesto y adelantado/atrasado, por actividad y de forma consolidada.

## Reglas de negocio

(fórmulas y condiciones extraídas literalmente del lenguaje ubicuo EVM/PMI del proyecto — no reinterpretar)

- **RN-01 [Cálculo de PV — Planned Value]:** `PV = % avance planificado a la fecha de corte × BAC`.
- **RN-02 [Cálculo de EV — Earned Value]:** `EV = % avance real completado × BAC`.
- **RN-03 [Cálculo de CV — Cost Variance]:** `CV = EV − AC`. Interpretación: `CV > 0` favorable (bajo presupuesto); `CV = 0` neutro; `CV < 0` desfavorable (sobrecosto).
- **RN-04 [Cálculo de SV — Schedule Variance]:** `SV = EV − PV`. Interpretación: `SV > 0` favorable (adelantado); `SV = 0` neutro (alineado con el cronograma); `SV < 0` desfavorable (atrasado). Nota de dominio: al 100% de avance, `EV = BAC` y `PV = BAC`, por lo que `SV = 0` independientemente de si el proyecto terminó tarde — no interpretar SV=0 como "sin desviación de cronograma" quando el avance es 100%.
- **RN-05 [Cálculo de CPI — Cost Performance Index]:** `CPI = EV / AC`. Interpretación: `CPI > 1.0` alta eficiencia (más de 1 unidad de valor por unidad gastada); `CPI = 1.0` eficiencia nominal; `CPI < 1.0` baja eficiencia/déficit de gasto.
- **RN-06 [Cálculo de SPI — Schedule Performance Index]:** `SPI = EV / PV`. Interpretación: `SPI > 1.0` ritmo más rápido que lo planificado; `SPI = 1.0` ritmo exactamente igual al plan; `SPI < 1.0` ritmo inferior al plan.
- **RN-07 [Cálculo de EAC — Estimate at Completion, modelo "tasa típica"]:** `EAC = BAC / CPI` (único modelo de EAC dentro del alcance de esta idea; los modelos "tasa atípica" y "combinado costo-cronograma" del lenguaje ubicuo quedan fuera de alcance).
- **RN-08 [Cálculo de VAC — Variance at Completion]:** `VAC = BAC − EAC`. Interpretación: `VAC > 0` ahorro proyectado; `VAC < 0` sobrecosto final proyectado.
- **RN-09 [Manejo de división por cero — invariante obligatoria]:** cuando `AC = 0`, `CPI` no es matemáticamente calculable (división por cero) — el backend DEBE devolver `CPI` como `null`/no-disponible (nunca lanzar una excepción no controlada ni devolver `Infinity`), con una interpretación textual explícita del tipo "Sin costo real registrado — CPI no aplicable" en vez de "bajo/sobre presupuesto". Consecuentemente, `EAC = BAC / CPI` tampoco es calculable cuando `CPI` es `null`: el backend DEBE devolver `EAC` y `VAC` también como `null`/no-disponible en ese caso, con la misma razón explícita. Análogamente, cuando `PV = 0`, `SPI` no es calculable: mismo tratamiento (`null` + interpretación textual explícita, p. ej. "Sin avance planificado a la fecha — SPI no aplicable").
- **RN-10 [Rango válido de porcentajes de avance]:** `% avance planificado` y `% avance real` son valores entre 0 y 100 inclusive (`ProgressPercentage` del lenguaje ubicuo). El backend DEBE rechazar (HTTP 422) cualquier valor fuera de ese rango al crear o editar una actividad.
- **RN-11 [No negatividad de valores monetarios]:** `BAC` y `AC` DEBEN ser mayores o iguales a cero. El backend DEBE rechazar (HTTP 422) valores negativos al crear o editar una actividad.
- **RN-12 [Consolidación por proyecto]:** los indicadores consolidados de un proyecto se calculan agregando primero los valores base de todas sus actividades (`BAC total = Σ BAC de actividades`, `PV total = Σ PV de actividades`, `EV total = Σ EV de actividades`, `AC total = Σ AC de actividades`) y luego aplicando las mismas fórmulas RN-01 a RN-08 sobre esos totales agregados — nunca promediando los índices (CPI, SPI) individuales de cada actividad directamente, porque eso distorsiona el resultado cuando las actividades tienen presupuestos de magnitud distinta.
- **RN-13 [Proyecto sin actividades]:** cuando un proyecto no tiene actividades, todos sus totales base (`BAC`, `PV`, `EV`, `AC` consolidados) son 0, y por tanto `CPI`/`SPI`/`EAC`/`VAC` consolidados son `null`/no-disponibles por la misma regla RN-09 (división por cero de `AC=0` y `PV=0`). El backend DEBE devolver una respuesta válida y explícita en este caso (nunca un error 500 ni una lista vacía sin indicadores) — indicadores en `null` con su interpretación textual, no un error.

## Requerimientos funcionales (EARS)

### REQ-01: Gestión de proyectos

- **Como** líder de proyecto **quiero** crear, editar y eliminar proyectos **para** organizar el trabajo que voy a medir con EVM.
- `EL SISTEMA DEBE` exponer endpoints REST de creación, edición, eliminación y consulta (individual y listado) de proyectos.
- `CUANDO` se crea un proyecto con un `name` vacío o ausente `EL SISTEMA DEBE` rechazar la petición con HTTP 422 y un mensaje explícito.
- `SI` se solicita eliminar un proyecto inexistente `EL SISTEMA DEBE` responder HTTP 404.

### REQ-02: Gestión de actividades

- **Como** líder de proyecto **quiero** crear, editar y eliminar actividades dentro de un proyecto **para** registrar el trabajo planificado y ejecutado.
- `EL SISTEMA DEBE` exponer endpoints REST de creación, edición, eliminación y consulta (individual y listado por proyecto) de actividades, cada una asociada a un `project_id` existente.
- `CUANDO` se crea o edita una actividad con `budget_at_completion` o `actual_cost` negativos `EL SISTEMA DEBE` rechazar la petición con HTTP 422 (RN-11).
- `CUANDO` se crea o edita una actividad con `planned_progress_percentage` o `actual_progress_percentage` fuera del rango 0-100 `EL SISTEMA DEBE` rechazar la petición con HTTP 422 (RN-10).
- `SI` se solicita crear una actividad con un `project_id` inexistente `EL SISTEMA DEBE` responder HTTP 404.
- `SI` se solicita eliminar una actividad inexistente `EL SISTEMA DEBE` responder HTTP 404.

### REQ-03: Cálculo de indicadores EVM por actividad

- **Como** líder de proyecto **quiero** ver los indicadores EVM calculados de cada actividad **para** saber si esa actividad individual va bien o mal en costo y cronograma.
- `EL SISTEMA DEBE` calcular y devolver PV, EV, CV, SV, CPI, SPI, EAC y VAC (RN-01 a RN-08) en cada respuesta de lectura de una actividad, sin persistir estos valores.
- `SI` `AC = 0` o `PV = 0` `EL SISTEMA DEBE` aplicar RN-09 (indicadores dependientes en `null` con interpretación textual explícita, nunca error ni `Infinity`).

### REQ-04: Interpretación textual de CPI y SPI

- **Como** líder de proyecto **quiero** una interpretación en texto simple de CPI y SPI **para** entender el estado sin tener que interpretar los números yo mismo.
- `EL SISTEMA DEBE` devolver, junto a cada CPI y SPI calculado (por actividad y consolidado), un texto de interpretación acorde a RN-05/RN-06 (p. ej. "Bajo presupuesto", "Sobre presupuesto", "Eficiencia nominal", "Adelantado", "Atrasado", "En tiempo", o el texto de no-aplicable de RN-09 cuando corresponda).

### REQ-05: Indicadores consolidados por proyecto

- **Como** líder de proyecto **quiero** ver los indicadores EVM consolidados de todo el proyecto **para** entender la salud global del proyecto, no solo actividad por actividad.
- `EL SISTEMA DEBE` calcular y devolver los indicadores consolidados de un proyecto agregando sus actividades según RN-12, incluyendo el caso de proyecto sin actividades (RN-13).

### REQ-06: Dashboard visual

- **Como** líder de proyecto **quiero** ver mis actividades e indicadores en un dashboard visual **para** entender de un vistazo el estado del proyecto sin leer números en crudo.
- `EL SISTEMA DEBE` mostrar una tabla de actividades con sus indicadores calculados, un bloque de indicadores consolidados del proyecto, una indicación visual (color + ícono, nunca solo color) del estado de CPI/SPI por actividad y consolidado, y una gráfica comparativa de PV/EV/AC por actividad.
- `EL SISTEMA DEBE` permitir crear/editar/eliminar actividades desde el mismo dashboard, reflejando el recálculo de indicadores inmediatamente tras guardar.

### REQ-07: Documentación de API

- **Como** desarrollador integrador **quiero** consultar la documentación OpenAPI del API **para** entender el contrato sin leer el código fuente.
- `EL SISTEMA DEBE` exponer la documentación interactiva (Swagger UI) accesible localmente en `/api-docs` o `/swagger-ui`, con descripción, esquemas de request/response y códigos de error de cada endpoint.

## Edge cases y condiciones límite

| ID | Escenario | Comportamiento esperado |
|---|---|---|
| EC-01 | Actividad con `actual_cost = 0` (AC=0) | `CPI` y, en cascada, `EAC`/`VAC` se devuelven como `null` con interpretación textual "Sin costo real registrado — CPI no aplicable" (RN-09). `CV`, `SV`, `SPI` se calculan normalmente si `PV != 0`. |
| EC-02 | Actividad con `planned_progress_percentage = 0` (PV=0) | `SPI` se devuelve como `null` con interpretación textual "Sin avance planificado a la fecha — SPI no aplicable" (RN-09). `CV`, `CPI` (si AC!=0) se calculan normalmente. |
| EC-03 | Proyecto sin actividades | Todos los totales base consolidados son 0; `CPI`/`SPI`/`EAC`/`VAC` consolidados en `null` con interpretación textual; respuesta HTTP 200 válida, nunca 500 (RN-13). |
| EC-04 | Actividad con `actual_progress_percentage = 0` (avance real = 0, AC>0) | `EV = 0`; `CV = -AC` (negativo, desfavorable); `CPI = 0/AC = 0` (< 1.0, baja eficiencia) — se calcula normalmente, no es división por cero. |
| EC-05 | `budget_at_completion = 0` (BAC=0) en una actividad | `PV = 0` y `EV = 0` siempre, independientemente de los porcentajes. Aplica EC-02 en cascada para SPI. `EAC = 0 / CPI = 0` si CPI es calculable; si CPI es `null` (AC=0), `EAC` también `null`. |
| EC-06 | `actual_progress_percentage > planned_progress_percentage` con costos bajo lo planificado | Caso favorable normal (adelantado y bajo presupuesto) — no es un edge case de error, solo debe reflejarse correctamente en `CV > 0` y `SV > 0`. |
| EC-07 | Intento de crear actividad con `project_id` inexistente | HTTP 404, sin crear el registro (REQ-02). |
| EC-08 | Porcentaje de avance fuera de rango (negativo o > 100) | HTTP 422, sin persistir el cambio (RN-10). |
| EC-09 | `budget_at_completion` o `actual_cost` negativos | HTTP 422, sin persistir el cambio (RN-11). |

## Modelo de dominio

Contexto delimitado NUEVO — no existe `domain-model.md` previo en el proyecto. **Nota explícita:** SPEC debe formalizar `domain-model.md` (en `apps/backend/`, ver sección "Descomposición en specs" arriba) a partir de esta propuesta antes de escribir `requirements.md`/`design.md`. Entidades, invariantes y lenguaje ubicuo propuestos, extraídos del lenguaje ubicuo formal EVM/PMI del proyecto y simplificados al alcance real de esta idea:

- **`Project`** (Agregado / Entidad Raíz): representa el esfuerzo temporal que agrupa actividades. Atributos: `id` (UUID), `name`, `description` (opcional). Invariante: `name` no vacío. Relación: 1 `Project` tiene muchas `Activity`.
- **`Activity`** (Entidad — equivalente simplificado de Control Account/Work Package del lenguaje ubicuo, sin descomponer en WBS formal): representa el paquete de trabajo medible dentro de un proyecto. Atributos: `id` (UUID), `name`, `budgetAtCompletion` (BAC), `plannedProgressPercentage`, `actualProgressPercentage`, `actualCost` (AC). Invariantes: `budgetAtCompletion >= 0` (RN-11), `actualCost >= 0` (RN-11), `plannedProgressPercentage` y `actualProgressPercentage` entre 0 y 100 (RN-10).
- **`EvmIndicatorSet`** (Objeto de Valor, calculado — no persistido): agrupa PV, EV, CV, SV, CPI, SPI, EAC, VAC y sus interpretaciones textuales, calculado a demanda a partir de una `Activity` (o de la agregación de todas las `Activity` de un `Project`, RN-12). Invariante: cualquier campo cuyo divisor de fórmula sea 0 se expone como `null` con interpretación textual explícita (RN-09), nunca como excepción ni `Infinity`.
- **`ProgressPercentage`** (Objeto de Valor): representación de un porcentaje de avance físico, 0.0 a 100.0, tomado directamente del lenguaje ubicuo del proyecto.
- **`MonetaryAmount`** (Objeto de Valor, simplificado): cantidad decimal no negativa, sin moneda explícita en el alcance de esta idea (ver "Fuera de alcance" — multi-moneda).
- Simplificación explícita respecto al lenguaje ubicuo completo del proyecto (documentado para que SPEC no la reabra): `ControlAccount` y `PerformanceSnapshot` del lenguaje ubicuo NO se modelan como entidades/agregados separados en esta idea — `Activity` cumple el rol simplificado de unidad de medición EVM, y no existe persistencia de snapshots históricos (ver "Fuera de alcance").

## Diseño de datos

El archivo `db-design.dbml`, adjunto en esta misma carpeta, es el diseño de base de datos obligatorio a seguir. Contiene 2 tablas: `projects` (id UUID, name, description, created_at/updated_at) y `activities` (id UUID, project_id FK a `projects.id` con `delete: cascade`, name, budget_at_completion, planned_progress_percentage, actual_progress_percentage, actual_cost, created_at/updated_at, índice explícito en `project_id`). Decisión cerrada: los indicadores EVM (`EvmIndicatorSet`) NO se persisten — se calculan en tiempo real en el backend a partir de los 4 campos de negocio de `activities`. Cada campo de negocio del DBML incluye anotaciones (`Note`) con su rol exacto en las fórmulas EVM, para que un LLM sin contexto adicional entienda el propósito de cada columna.

## Arquitectura y stack técnico

- **Arquitectura:** Hexagonal (Puertos y Adaptadores) por defecto en `apps/backend/` — tres carpetas `domain/` (entidades `Project`/`Activity`, objeto de valor `EvmIndicatorSet` y el servicio de dominio que calcula los indicadores según RN-01 a RN-13, sin I/O), `application/` (casos de uso: crear/editar/eliminar/listar proyecto, crear/editar/eliminar/listar actividad, obtener indicadores de actividad, obtener indicadores consolidados de proyecto — y los puertos `in`/`out` correspondientes), `infra/` (adaptador `in` HTTP con FastAPI/routers, adaptador `out` de persistencia con SQL directo vía psycopg3, sin ORM). `apps/frontend/` es capa de presentación pura (sin dominio propio): componentes de UI, llamadas HTTP al backend, pintado de datos recibidos. `apps/db/` no tiene lógica, solo esquema y migraciones. `apps/infrastructure/` solo orquesta.
- **Stack y versiones fijadas** (investigadas por LEARN, ver `learning.md` para el detalle y los patrones de código completos):
  - `apps/db/`: PostgreSQL `18` (imagen Docker oficial `postgres:18`), tipos `UUID` (`gen_random_uuid()` nativo) y `TIMESTAMPTZ`.
  - `apps/backend/`: Python `3.14.7`, FastAPI `0.141.1` con **Pydantic v2** (obligatorio — FastAPI eliminó el soporte de Pydantic v1, incompatible con Python 3.14), gestor de paquetes/entornos `uv` `0.12.9`, sin ORM (SQL directo con `psycopg` `3.2.10`, pool `ConnectionPool`, siempre parametrizado con `%s` — nunca interpolación de strings, previene inyección SQL), migraciones con `yoyo-migrations` `9.0.0` (SQL puro, comando `yoyo apply --batch` en Docker), linter/formatter `ruff` `0.16.3` (`ruff check` + `ruff format`, sustituye black+flake8), Docker multi-stage con imagen base `ghcr.io/astral-sh/uv:python3.14-trixie-slim` para build y `python:3.14-slim-trixie` para runtime.
  - `apps/frontend/`: React `19.3.0`, TypeScript `7.0.2`, Vite `8.0.10` (scaffolding `npm create vite@latest apps/frontend -- --template react-ts`), Node.js `24` LTS, librería de gráficos **Recharts `3.10.1`** (elegida por IDEA: React-first, SVG, sin incompatibilidad reportada con React 19, opción por defecto documentada para dashboards React en 2026), linter `ESLint` `10.10.0` (flat config `eslint.config.js`) + formateador `Prettier` `3.9.6` (elegidos por IDEA sobre Biome por tener evidencia de fuente primaria de mayor confianza para este proyecto nuevo), Docker multi-stage con `node:24-slim` (build) → `nginx:stable-alpine` (runtime, sirve el `dist/` estático).
  - `apps/infrastructure/`: Docker Compose V2 (`docker compose`, archivo `compose.yaml`), con `depends_on.condition: service_healthy` (db) y `service_completed_successfully` (contenedor de migraciones) para garantizar orden de arranque db → migraciones → backend → frontend, tanto en primer arranque como en arranques posteriores.
- **Justificación:** Cada versión es la estable más reciente disponible a la fecha de esta idea (dependencias nuevas del proyecto, sin versión previa instalada que preservar — ver `learning.md`). La compatibilidad de `yoyo-migrations` y de `FastAPI` con Python 3.14 — antes documentada como riesgo de evidencia incompleta — quedó confirmada por validación manual del USUARIO (ver "Riesgos y mitigaciones" y `viability.md`).
- **Configuración de verificación local (lefthook):** Proyecto nuevo, sin `lefthook.yml` todavía — IDEA cierra el contenido completo cubriendo todo el stack detectado (Python en `apps/backend/`, TypeScript/React en `apps/frontend/`), listo para copiar a la raíz del repositorio sin placeholders. La sintaxis (campo `commands:`, no `jobs:`) está resuelta contra la plantilla propia de MakIA ya existente en el proyecto (`.makia/core/harness/templates/lefthook.example.yml`), que además ya incluye el hook `commit-msg` de convención de MakIA (no se repite aquí, ya está listo para usar tal cual esa plantilla lo define). Contenido completo de la sección `pre-commit` a agregar sobre esa misma plantilla:

  ```yaml
  pre-commit:
    parallel: true
    commands:
      backend-lint:
        root: "apps/backend/"
        glob: "*.py"
        run: uv run ruff check {staged_files}
      backend-format:
        root: "apps/backend/"
        glob: "*.py"
        run: uv run ruff format --check {staged_files}
      frontend-lint:
        root: "apps/frontend/"
        glob: "*.{ts,tsx}"
        run: npx eslint --fix {staged_files}
      frontend-format:
        root: "apps/frontend/"
        glob: "*.{ts,tsx}"
        run: npx prettier --write {staged_files}
  ```

## Estrategia de seguridad

- **Inyección SQL:** obligatorio el uso exclusivo de consultas parametrizadas con `psycopg` (placeholders `%s`, nunca interpolación/concatenación de strings) en toda la capa `infra/` del backend — es la única vía de acceso a datos, al no usar ORM.
- **Validación de entrada (OWASP):** toda entrada de la API (creación/edición de proyectos y actividades) se valida con modelos Pydantic de FastAPI antes de tocar el dominio — tipos, rangos (RN-10, RN-11), presencia de campos obligatorios. Ninguna validación de negocio vive en el frontend (regla explícita del alcance).
- **Manejo de secretos:** credenciales de PostgreSQL (usuario/password/cadena de conexión) se inyectan por variables de entorno vía `docker-compose`/`.env`, nunca hardcodeadas en el código ni comiteadas al repositorio.
- **CORS:** el backend restringe los orígenes permitidos al del frontend (configurable por variable de entorno), no usa `*` en producción interna.
- **Idempotencia:** esta herramienta es de uso interno sin pagos ni webhooks. Las únicas operaciones con efecto de lado son las mutaciones CRUD de proyectos/actividades: la creación (`POST`) no es naturalmente idempotente pero tiene bajo riesgo (uso interno, un único usuario por sesión, sin reintentos automáticos de red esperados) — no requiere mecanismo adicional de idempotencia en el alcance de esta idea. La edición (`PUT`/`PATCH` que fija el estado completo del recurso) y el borrado por `id` son naturalmente idempotentes (repetir la misma petición produce el mismo estado final) y no requieren mecanismo extra. Se documenta explícitamente para que SPEC no lo reabra.
- **Capa visual (frontend):** los botones de guardar/eliminar se bloquean o muestran loader mientras la petición está en curso (evita doble-submit); los inputs numéricos (BAC, AC, porcentajes) usan tipo `number` con restricción de caracteres acorde.

## Observabilidad

El backend debe loguear (nivel INFO) cada operación de mutación (creación/edición/eliminación de proyecto o actividad) con su `id` y `project_id` asociado, y (nivel WARNING) cada vez que se devuelve un indicador `null` por división por cero (RN-09), incluyendo el `activity_id`/`project_id` afectado — esto permite triangular, ante una duda del líder de proyecto sobre "por qué no veo el CPI de esta actividad", si fue una decisión de diseño (AC=0) o un error real. Los errores de validación (HTTP 422/404) se loguean a nivel INFO con el detalle del rechazo, no como error de servidor.

## Estrategia de pruebas

- **Unitarias (capa de negocio, `domain/` y `application/` de `apps/backend/`):** cobertura mínima 80%, cubriendo explícitamente los edge cases EC-01 a EC-09 (incluyendo AC=0, proyecto sin actividades, avance real=0, BAC=0, porcentajes fuera de rango).
- **Integración:** al menos 1 test de integración por endpoint REST (proyectos y actividades, CRUD completo y consulta de indicadores), validando el contrato de request/response contra el esquema real de PostgreSQL de `apps/db/`.
- **Frontend:** validación manual/exploratoria del dashboard contra los datos reales del backend no está cubierta como requerimiento explícito por el alcance del usuario (el alcance solo exige cobertura de tests en "capa de negocio" y "por endpoint", ambos backend) — SPEC puede definir tests de componente si lo considera necesario, sin que sea un requerimiento cerrado de esta idea.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fuente externa de menor confianza sobre sintaxis de `lefthook.yml` (posible campo `jobs:` en vez de `commands:` en algunas versiones) | Nulo para esta idea | Resuelto ya en este `draft.md`: se usó la plantilla interna de MakIA (`.makia/core/harness/templates/lefthook.example.yml`) como fuente de verdad, no la fuente externa de menor confianza |
| Cálculo de indicadores con divisores en cero (AC=0, PV=0, proyecto sin actividades) mal manejado por CODE (excepción no controlada o `Infinity`) | Alto — rompería la respuesta de la API en casos de uso reales y frecuentes (proyecto recién creado) | RN-09/RN-13 y los edge cases EC-01/EC-02/EC-03 quedan explícitos y con cobertura de test obligatoria (≥80% capa de negocio) |

**Riesgos cerrados (antes en esta tabla, ahora confirmados — ver `viability.md`, sección Evidence):**
- `yoyo-migrations` 9.0.0 + Python 3.14: **compatible**, confirmado por validación manual del USUARIO (librería en Python puro, sin extensiones C). Nota operativa vigente para IMPLEMENT (no riesgo de IDEA): verificar que `psycopg` 3.2.10 soporte Python 3.14 en la instalación real de `evm-project-tool-db`/`evm-project-tool-backend`, y usar la versión estable más reciente de yoyo-migrations en PyPI al momento de IMPLEMENT.
- FastAPI 0.141.1 + Python 3.14: **compatible** (FastAPI soporta Python 3.14 desde 0.135.4+), confirmado por validación manual del USUARIO. Derivado de esta confirmación, obligatorio usar Pydantic v2 (Pydantic v1 no es compatible con Python 3.14 y FastAPI ya no lo soporta). Nota operativa vigente para IMPLEMENT: prestar atención a extensiones de terceros con código C aún no adaptadas a Python 3.14.

## Decisiones tomadas

- Idea-slug: `evm-project-tool`.
- N=1 feature, capacidad multi-unidad (4 unit-specs), sin eje "app completa / multi-feature".
- Orden de creación fijo: `db → backend → frontend → infrastructure`; `backend` es dueño único del `domain-model.md`.
- Indicadores EVM (`EvmIndicatorSet`) se calculan en tiempo real, nunca se persisten — sin tabla de histórico/snapshot en esta idea.
- Único modelo de EAC dentro de alcance: `BAC / CPI` (tasa típica). TCPI y ETC quedan fuera de alcance.
- Sin autenticación/autorización, sin multi-moneda, sin notificaciones automáticas de umbral — todo documentado en "Fuera de alcance".
- Librería de gráficos: Recharts `3.10.1`. Linter/formatter frontend: ESLint `10.10.0` + Prettier `3.9.6` (sobre Biome, por mayor evidencia de fuente primaria para este proyecto nuevo). Linter/formatter backend: `ruff` `0.16.3`.
- Contenido completo de `lefthook.yml` (`pre-commit`) cerrado en la sección "Arquitectura y stack técnico" — SPEC/IMPLEMENT lo usan tal cual, sin reabrir la decisión.
- `.makia/config/git.md` ya fijó (fuente externa a IDEA, vinculante): `develop` es la rama de consolidación única y permanente de este proyecto — no existe una rama `makia/dev/evm-project-tool` — y cada unit-spec se desarrolla en su propia rama `makia/<tipo>/<spec-slug>` creada desde `develop`, integrada por Pull Request.
- Pydantic v2 es obligatorio en `apps/backend/` (FastAPI eliminó el soporte de Pydantic v1, incompatible con Python 3.14) — decisión cerrada, no reabrir en SPEC/IMPLEMENT.
- Compatibilidad de `yoyo-migrations` 9.0.0 y `FastAPI` 0.141.1 con Python 3.14 quedó CONFIRMADA por validación manual del USUARIO, cerrando los 2 riesgos de evidencia incompleta que IDEA había dejado abiertos (ver `viability.md` y "Riesgos y mitigaciones" arriba). Quedan solo notas operativas para IMPLEMENT (verificar `psycopg` contra Python 3.14 en la instalación real; usar la versión más reciente de yoyo-migrations en PyPI), no riesgos.

## Recomendaciones de implementación

Seguir estrictamente el orden de creación (`db → backend → frontend → infrastructure`) porque cada unidad depende del contrato real (esquema SQL, luego contrato OpenAPI) de la anterior, no de una suposición. Dentro de `apps/backend/`, implementar primero el servicio de dominio que calcula `EvmIndicatorSet` (RN-01 a RN-13) con sus tests unitarios de edge cases (EC-01 a EC-06) ANTES que los endpoints REST, para que la validación de la lógica de negocio no dependa de tener la capa HTTP lista. `apps/infrastructure/` puede empezar a escribirse en paralelo con la cola de `frontend` una vez que los `Dockerfile` de `db`/`backend`/`frontend` existan (aunque no estén 100% terminados), porque el `compose.yaml` en sí mismo no requiere que la lógica de negocio esté completa, solo que exista un `Dockerfile` construible por servicio — SPEC confirma este solape real con el footprint de `design.md`.

## Criterios de aceptación / Definition of Done

- CRUD de proyectos y actividades funcional end-to-end (API real, DB real, sin mocks).
- Los 8 indicadores EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC) se calculan correctamente por actividad y consolidados por proyecto, verificado con tests unitarios que cubren EC-01 a EC-09.
- Interpretación textual de CPI/SPI presente en toda respuesta que incluya esos indicadores.
- Dashboard muestra tabla de actividades con indicadores, indicadores consolidados, indicación visual de estado (color + ícono + texto, nunca solo color) y gráfica PV/EV/AC por actividad.
- Documentación OpenAPI accesible en `/api-docs` o `/swagger-ui`, con descripción, esquemas y códigos de error por endpoint.
- `docker compose up` (primer arranque y arranques posteriores) levanta DB + migraciones + backend + frontend sin pasos manuales adicionales.
- Cobertura de tests ≥80% en capa de negocio del backend, ≥1 test de integración por endpoint.
- Cero code smells (sin bloques comentados, sin variables sin usar, sin números/strings mágicos, nombres descriptivos, lógica de negocio fuera de los controladores).
- `README.md` con comandos de ejecución local y de ejecución de tests.
- `lefthook.yml` en la raíz del repositorio, funcional, con los hooks de `apps/backend/` y `apps/frontend/` definidos en este documento.
