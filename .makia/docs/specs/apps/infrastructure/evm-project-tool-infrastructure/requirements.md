# Orquestación local de EVM Project Tool

> Este documento es el **artefacto de aprobación del USUARIO**. Debe ser autosuficiente: todo lo necesario para aprobar el alcance, los objetivos y los criterios de éxito del spec está aquí, sin necesidad de leer `design.md` ni `tasks.md`.

- **Spec:** `evm-project-tool-infrastructure`
- **Unidad de código:** `apps/infrastructure/`

## Resumen

Esta unidad implementa la orquestación local del sistema EVM Project Tool mediante **Docker Compose V2** (`compose.yaml`, comando `docker compose`). Su única responsabilidad es levantar, en el orden correcto y con un solo comando, las cuatro capas que componen la capacidad completa: base de datos PostgreSQL, aplicación de migraciones SQL, API backend y frontend estático. No contiene lógica de negocio, no define el esquema de datos ni la interfaz de usuario — solo conecta y coordina los contenedores definidos por las unidades `evm-project-tool-db`, `evm-project-tool-backend` y `evm-project-tool-frontend`.

El dominio funcional del producto (proyectos, actividades, indicadores EVM) está descrito conceptualmente en `../../backend/domain-model.md`; esta unidad no lo implementa ni lo valida, solo garantiza que el entorno local donde esas capacidades se ejecutan arranque de forma reproducible.

## Problema

Un desarrollador, evaluador o líder de proyecto que quiera usar la herramienta EVM Project Tool en local necesita levantar cuatro piezas interdependientes: PostgreSQL con esquema migrado, API FastAPI conectada a esa base de datos, y frontend React servido por nginx apuntando al backend. Sin orquestación unificada, el arranque manual implica:

- Ejecutar la base de datos y esperar a que esté lista antes de migrar.
- Aplicar migraciones antes de que el backend intente conectarse.
- Configurar variables de entorno coherentes entre servicios (`DATABASE_URL`, `CORS_ORIGINS`, `VITE_API_BASE_URL`).
- Repetir estos pasos en cada máquina nueva o tras limpiar volúmenes.

Esa fricción bloquea la validación end-to-end de la capacidad, dificulta la evaluación del proyecto y contradice el criterio de éxito conjunto de la idea: **un solo comando debe levantar todo el sistema**, tanto en el primer arranque como en arranques posteriores.

## Solución

- **En qué consiste:** un archivo `compose.yaml` en `apps/infrastructure/` (o ruta equivalente acordada dentro de esa unidad) que define los servicios `db`, `migrate`, `backend` y `frontend`, con dependencias explícitas que garantizan el orden **db (healthy) → migrate (completed successfully) → backend → frontend**, usando Docker Compose V2 y el comando `docker compose` (sin guion).
- **Cómo se usa:** el operador copia/configura un `.env` con secretos y valores de conexión (nunca comiteados con credenciales reales), se sitúa en el directorio de la unidad de infraestructura y ejecuta `docker compose up` (o variantes documentadas como `up --build`, `down`, etc.). No se requieren scripts wrapper de plataforma (`.cmd`, `.bat`, `.ps1`, `.sh`) como punto de entrada obligatorio.
- **Qué no hace:** no escribe migraciones SQL (propiedad de `apps/db/`), no implementa endpoints ni reglas EVM (propiedad de `apps/backend/`), no construye componentes de UI (propiedad de `apps/frontend/`), no configura lefthook (ya cubierto por la unidad db), no despliega en Kubernetes ni en cloud de producción.

## Objetivos y criterios de éxito

- **Objetivo 1:** cualquier operador con Docker Compose V2 instalado puede levantar el sistema completo (DB + migraciones + backend + frontend) con **un único comando** (`docker compose up`), sin pasos manuales intermedios, tanto en el **primer arranque** (volumen de datos vacío) como en **arranques posteriores** (volumen ya existente).

- **Objetivo 2:** el orden de arranque está **garantizado por Compose**, no por convención humana: la base de datos debe reportar salud antes de migrar; las migraciones deben completarse con éxito antes de que el backend arranque; el frontend solo arranca después de que el backend esté disponible según la condición de dependencia definida en el compose.

- **Objetivo 3:** la configuración sensible (credenciales de PostgreSQL, URLs, orígenes CORS) se inyecta exclusivamente mediante **variables de entorno** (archivo `.env` local o entorno del shell), **sin credenciales reales hardcodeadas** en archivos comiteados al repositorio.

- **Objetivo 4:** tras un arranque exitoso, el operador puede acceder al frontend en el puerto publicado (nginx, puerto **80** en el contenedor), al backend en el puerto **8000**, y a la documentación Swagger del backend en **`/api-docs`**, con el API REST bajo el prefijo **`/api/v1`**, verificando conectividad end-to-end sin intervención manual adicional.

- **Criterio de éxito conjunto (E2E cross-unidad):** ejecutar `docker compose up` desde `apps/infrastructure/` levanta las **4 capas** (db, migrate, backend, frontend) y el sistema queda operativo para uso local; este criterio es la condición de Done compartida con las demás unidades de la capacidad EVM Project Tool.

## Actores de negocio y flujo de valor

- **Desarrollador / evaluador técnico:** actor principal — necesita un entorno local reproducible para desarrollar, probar y demostrar la herramienta sin montar manualmente cada servicio.
- **Líder de proyecto (usuario final indirecto):** se beneficia cuando el evaluador puede levantar la herramienta completa de forma fiable para revisar indicadores EVM sobre proyectos y actividades reales en local.
- **Unidades consumidoras (`evm-project-tool-db`, `evm-project-tool-backend`, `evm-project-tool-frontend`):** proveen los artefactos (migraciones SQL, Dockerfiles, imágenes) que esta unidad orquesta; no definen el orden de arranque ni el cableado de red entre contenedores.

---

## Coordinación multi-unidad

La capacidad EVM Project Tool se implementa en **cuatro unidades** con orden de creación estricto: **`db → backend → frontend → infrastructure`**. Cada unidad posterior depende del contrato real de la anterior (esquema SQL, contrato OpenAPI, Dockerfiles construibles), no de suposiciones.

Esta unidad (`evm-project-tool-infrastructure`) es la **última** en implementarse. Depende explícitamente de que existan:

1. Migraciones SQL en `apps/db/migrations/` (unidad `evm-project-tool-db`), aplicables con `yoyo-migrations` 9.0.0 y comando `yoyo apply --batch`.
2. `Dockerfile` funcional en `apps/backend/` (unidad `evm-project-tool-backend`) con FastAPI Python 3.14, variables `DATABASE_URL`, `CORS_ORIGINS`, `LOG_LEVEL`, API en `/api/v1` y Swagger en `/api-docs`, puerto 8000.
3. `Dockerfile` funcional en `apps/frontend/` (unidad `evm-project-tool-frontend`) con build React/Vite y runtime `nginx:stable-alpine`, variable/build arg `VITE_API_BASE_URL`, puerto 80.

`apps/infrastructure/` puede iniciarse en **paralelo con la cola final de `frontend`** una vez que los Dockerfiles de backend y frontend sean construibles, aunque la lógica de negocio no esté 100 % terminada — el `compose.yaml` solo requiere imágenes construibles, no funcionalidad completa de la aplicación. SPEC confirma este solape mediante el footprint de `design.md` de cada unidad.

Esta unidad **no duplica** responsabilidades de otras unidades: no crea DDL, no implementa auth, no configura lefthook, no despliega en producción cloud.

---

## Delimitación del Alcance (Scope Boundaries)

### Dentro del Alcance (In Scope — Fase Actual)

- Archivo `compose.yaml` (Docker Compose V2) en `apps/infrastructure/` con servicios: **`db`**, **`migrate`**, **`backend`**, **`frontend`**.
- Comando único de arranque: `docker compose` (V2, sin guion).
- Orden de arranque garantizado:
  - `db`: imagen `postgres:18`, healthcheck hasta `service_healthy`.
  - `migrate`: contenedor que ejecuta `yoyo apply --batch` sobre SQL en `apps/db/migrations/`, depende de `db` con `condition: service_healthy`, finaliza con `service_completed_successfully`.
  - `backend`: depende de `migrate` con `condition: service_completed_successfully`.
  - `frontend`: depende de `backend` (condición que impida arrancar el frontend antes de que el backend esté listo).
- Gestión de secretos y configuración vía `.env` / variables de entorno (con plantilla `.env.example` comiteada sin secretos reales).
- Cableado de red interna: `DATABASE_URL` del backend apuntando al servicio `db`; `CORS_ORIGINS` incluyendo el origen del frontend; `VITE_API_BASE_URL` apuntando a la URL del backend accesible desde el navegador del operador.
- Publicación de puertos: backend **8000**, frontend **80** (mapeo a host documentado).
- Volúmenes para persistencia de datos PostgreSQL entre reinicios.
- Reinicios idempotentes: `docker compose up` repetido no corrompe el estado ni exige pasos manuales de recuperación en el caso normal.
- Documentación de comandos operativos (`up`, `down`, `up --build`, variables requeridas) en README del proyecto o README de la unidad de infraestructura.
- Aceptación E2E: validación de que las 4 capas levantan sin intervención manual.

### Fuera del Alcance (Out of Scope / Non-Goals)

- **Lógica de negocio EVM**, validaciones de dominio, cálculo de indicadores — responsabilidad exclusiva de `evm-project-tool-backend` y `domain-model.md`.
- **Interfaz de usuario**, componentes React, gráficos — responsabilidad exclusiva de `evm-project-tool-frontend`.
- **Definición y ownership de DDL/migraciones SQL** — responsabilidad exclusiva de `evm-project-tool-db` (`apps/db/migrations/`); esta unidad solo **invoca** `yoyo apply --batch`, no escribe migraciones.
- **Autenticación y autorización** — fuera de alcance de toda la capacidad en esta fase.
- **Despliegue en Kubernetes, cloud de producción, CI/CD de producción** más allá del compose local/dev — fuera de alcance.
- **lefthook** y hooks pre-commit — ya cubiertos por la unidad db; **no duplicar** configuración lefthook en infraestructura.
- **Scripts wrapper obligatorios** (`.cmd`, `.bat`, `.ps1`, `.sh`) como sustituto de `docker compose` — explícitamente excluidos; `docker compose` es el único punto de entrada multiplataforma requerido.
- **Monitoreo, alertas, backups automatizados, alta disponibilidad** — no aplican a esta fase local.

---

## Reglas de Negocio y Políticas de Orquestación

- **RN-INF-01 [Orden de arranque obligatorio]:** el sistema local DEBE respetar siempre la secuencia **db (saludable) → migrate (éxito) → backend → frontend**. Ningún servicio de aplicación puede iniciar omitiendo las dependencias anteriores.

- **RN-INF-02 [Migraciones antes del backend]:** el contenedor `backend` NO DEBE arrancar hasta que el contenedor `migrate` haya terminado con código de salida exitoso (`service_completed_successfully`). El backend asume un esquema ya aplicado.

- **RN-INF-03 [Backend antes del frontend]:** el contenedor `frontend` NO DEBE arrancar hasta que el servicio `backend` cumpla la condición de dependencia definida en el compose (como mínimo, no iniciar el frontend en paralelo descontrolado con el backend en frío).

- **RN-INF-04 [Sin secretos en el repositorio]:** credenciales reales de PostgreSQL, contraseñas, tokens o URLs con secretos embebidos NO DEBEN aparecer hardcodeadas en `compose.yaml`, Dockerfiles ni otros archivos comiteados. Solo placeholders en `.env.example`; valores reales en `.env` local (ignorado por git) o inyectados por el entorno del operador.

- **RN-INF-05 [Un solo punto de entrada]:** el arranque estándar del sistema completo en local DEBE ser `docker compose up` (desde el directorio que contiene `compose.yaml`). No se exigen scripts auxiliares de plataforma como requisito de aprobación.

- **RN-INF-06 [Compose V2 exclusivo]:** el archivo DEBE llamarse `compose.yaml` y operarse con el comando `docker compose` (plugin V2), no `docker-compose` legacy salvo que el operador lo elija por compatibilidad externa — el spec exige V2 como contrato del proyecto.

- **RN-INF-07 [Persistencia entre reinicios]:** los datos de PostgreSQL DEBEN persistir en un volumen Docker entre `docker compose down` y subsiguientes `docker compose up`, salvo que el operador elimine explícitamente el volumen — de modo que arranques posteriores no requieran re-seeding manual de datos.

- **RN-INF-08 [Idempotencia de migraciones en reinicio]:** en arranques posteriores, el contenedor `migrate` DEBE poder ejecutar `yoyo apply --batch` sobre una base ya migrada sin fallar ni duplicar cambios (delegando la idempotencia al comportamiento de `yoyo-migrations` 9.0.0 documentado en la unidad db).

- **RN-INF-09 [Stack fijado — no inventar versiones]:** las imágenes y herramientas orquestadas son las acordadas por IDEA y specs hermanos: `postgres:18`, `yoyo-migrations` 9.0.0, backend FastAPI Python 3.14, frontend con runtime `nginx:stable-alpine`. Esta unidad no sustituye versiones unilateralmente.

- **RN-INF-10 [CORS coherente con frontend]:** `CORS_ORIGINS` del backend DEBE incluir el origen HTTP desde el que el operador accede al frontend en local (p. ej. `http://localhost` con el puerto mapeado del host), configurado vía variable de entorno, no con wildcard `*` como valor por defecto documentado para uso interno.

---

## Requerimientos Funcionales y Criterios EARS

### REQ-01: Arranque con un solo comando

**Descripción:** el operador debe poder levantar todo el stack local con un único comando estándar de Docker Compose V2.

**Rationale:** elimina fricción de onboarding y cumple el criterio de evaluación del proyecto (TrycoreColombia — entorno reproducible).

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-1.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` proveer un `compose.yaml` en `apps/infrastructure/` ejecutable con `docker compose up` sin pasos manuales adicionales entre servicios (no ejecutar migraciones a mano, no levantar db en terminal separada).

- **REQ-1.2 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` el operador ejecuta `docker compose up` desde el directorio de infraestructura con un `.env` válido
  - `EL SISTEMA DEBE` iniciar automáticamente los servicios `db`, `migrate`, `backend` y `frontend` en la secuencia definida por dependencias.

- **REQ-1.3 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` el operador ejecuta `docker compose up` en un entorno donde las imágenes aún no existen localmente
  - `EL SISTEMA DEBE` construir las imágenes necesarias (backend, frontend, migrate si aplica) mediante las directivas `build` del compose o documentar explícitamente el uso de `docker compose up --build` como comando de primer arranque en la documentación de comandos.

- **REQ-1.4 (Excepción o Manejo de Invalidez):**
  - `SI` falta una variable de entorno obligatoria
  - `EL SISTEMA DEBE` fallar de forma visible (log de error del servicio afectado o mensaje de Compose) en lugar de arrancar con configuración silenciosamente incorrecta.

---

### REQ-02: Orden de arranque garantizado

**Descripción:** Docker Compose debe imponer el orden db → migrate → backend → frontend mediante `depends_on` con condiciones explícitas.

**Rationale:** evita condiciones de carrera (backend conectándose antes de que exista el esquema; frontend llamando API inexistente).

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-2.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` definir un healthcheck en el servicio `db` (imagen `postgres:18`) que permita usar `depends_on.db.condition: service_healthy`.

- **REQ-2.2 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` definir el servicio `migrate` con `depends_on.db.condition: service_healthy`.

- **REQ-2.3 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` definir el servicio `backend` con `depends_on.migrate.condition: service_completed_successfully`.

- **REQ-2.4 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` definir el servicio `frontend` con dependencia explícita de `backend` que impida el arranque del frontend antes de que el backend esté listo (`service_started` como mínimo, o `service_healthy` si el backend expone healthcheck).

- **REQ-2.5 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` el servicio `db` no alcanza estado healthy dentro del tiempo de healthcheck
  - `EL SISTEMA DEBE` impedir que `migrate` inicie (Compose no satisface la condición de dependencia).

- **REQ-2.6 (Excepción o Manejo de Invalidez):**
  - `SI` el contenedor `migrate` termina con error (código de salida distinto de cero)
  - `EL SISTEMA DEBE` impedir que `backend` arranque (`service_completed_successfully` no se cumple).

---

### REQ-03: Gestión de variables de entorno y secretos

**Descripción:** toda configuración sensible y parametrizable se externaliza a variables de entorno; el repositorio solo contiene plantillas sin secretos reales.

**Rationale:** OWASP y buenas prácticas de DevOps local — credenciales no viajan en git.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-3.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` cargar configuración desde archivo `.env` (Compose lo resuelve automáticamente en el directorio del compose) y/o variables de entorno del shell del operador.

- **REQ-3.2 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` proveer un archivo `.env.example` (o equivalente documentado) listando todas las variables requeridas con valores de ejemplo no secretos, sin contraseñas reales.

- **REQ-3.3 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` asegurar que `.env` con secretos reales esté excluido del control de versiones (entrada en `.gitignore` del proyecto o de la unidad).

- **REQ-3.4 (Excepción o Manejo de Invalidez):**
  - `EL SISTEMA NO DEBE` incluir contraseñas, tokens o cadenas de conexión con credenciales reales en archivos comiteados (`compose.yaml`, `.env.example`, Dockerfiles).

- **REQ-3.5 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` documentar qué variables son obligatorias para un arranque exitoso (usuario/contraseña/host/puerto de PostgreSQL, `DATABASE_URL` o componentes para construirla, `CORS_ORIGINS`, `LOG_LEVEL`, `VITE_API_BASE_URL`, etc.).

---

### REQ-04: Cableado de servicios (red, URLs, CORS)

**Descripción:** los servicios deben comunicarse con nombres de host de red Docker y URLs coherentes para navegador y backend.

**Rationale:** el frontend en el navegador no resuelve nombres internos de Compose; `VITE_API_BASE_URL` y `CORS_ORIGINS` deben alinearse.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-4.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` inyectar en el backend la variable `DATABASE_URL` apuntando al servicio `db` en la red interna de Compose (host de servicio `db`, no `localhost` desde dentro del contenedor backend).

- **REQ-4.2 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` inyectar en el backend `CORS_ORIGINS` con el origen del frontend tal como lo consume el navegador del operador (p. ej. `http://localhost:<puerto_host_frontend>`).

- **REQ-4.3 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` inyectar en el backend `LOG_LEVEL` configurable por entorno.

- **REQ-4.4 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` pasar `VITE_API_BASE_URL` al build o entorno del frontend de forma que la SPA compilada llame al backend en una URL alcanzable desde el **navegador** (típicamente `http://localhost:8000` cuando el puerto 8000 del backend está publicado al host).

- **REQ-4.5 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` publicar el puerto **8000** del backend y el puerto **80** del frontend (nginx) al host, con mapeos documentados.

- **REQ-4.6 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` el operador abre la URL del frontend en el navegador tras un arranque exitoso
  - `EL SISTEMA DEBE` permitir que las peticiones HTTP del frontend al backend no sean bloqueadas por CORS, dado un `CORS_ORIGINS` correctamente configurado.

---

### REQ-05: Servicio de base de datos (`db`)

**Descripción:** PostgreSQL 18 como servicio persistente con healthcheck.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-5.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` usar la imagen oficial `postgres:18` para el servicio `db`.

- **REQ-5.2 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` configurar usuario, contraseña y nombre de base de datos mediante variables de entorno estándar de PostgreSQL (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` o equivalentes documentados), sin valores secretos hardcodeados en el compose comiteado.

- **REQ-5.3 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` montar un volumen nombrado (o bind mount documentado) para persistir datos entre reinicios.

- **REQ-5.4 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` PostgreSQL acepta conexiones
  - `EL SISTEMA DEBE` reportar el servicio `db` como healthy vía healthcheck (p. ej. `pg_isready`).

---

### REQ-06: Contenedor de migraciones (`migrate`)

**Descripción:** aplicación automática de migraciones SQL de `apps/db/migrations/` con yoyo-migrations 9.0.0 antes del backend.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-6.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` definir un servicio `migrate` (o nombre equivalente documentado) cuyo propósito exclusivo en el ciclo de arranque sea ejecutar `yoyo apply --batch`.

- **REQ-6.2 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` montar o copiar el directorio `apps/db/migrations/` para que yoyo encuentre las migraciones SQL definidas por la unidad db.

- **REQ-6.3 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` usar `yoyo-migrations` 9.0.0 (incluido en la imagen del contenedor migrate, típicamente derivada del entorno Python del backend según convención del proyecto).

- **REQ-6.4 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` configurar la cadena de conexión de yoyo hacia el servicio `db` en la red interna (formato compatible con psycopg3, p. ej. `postgresql+psycopg://...`).

- **REQ-6.5 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` `migrate` finaliza correctamente
  - `EL SISTEMA DEBE` dejar el esquema definido por las migraciones de `evm-project-tool-db` aplicado en la base de datos.

- **REQ-6.6 (Opcional / Comportamiento de reinicio):**
  - `CUANDO` `migrate` se ejecuta sobre una base ya migrada
  - `EL SISTEMA DEBE` completar sin error gracias a la idempotencia de yoyo (ver EC-INF-03).

- **REQ-6.7 (Excepción o Manejo de Invalidez):**
  - `SI` una migración SQL falla
  - `EL SISTEMA DEBE` terminar el contenedor `migrate` con error, impidiendo el arranque del backend.

---

### REQ-07: Servicios de aplicación (`backend` y `frontend`)

**Descripción:** contenedores de API y SPA alineados con los specs hermanos.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-7.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` construir el servicio `backend` desde `apps/backend/Dockerfile` (FastAPI, Python 3.14).

- **REQ-7.2 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` construir el servicio `frontend` desde `apps/frontend/Dockerfile` (build React/Vite, runtime `nginx:stable-alpine`).

- **REQ-7.3 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` exponer el backend en el puerto **8000** con API REST bajo **`/api/v1`** y documentación Swagger accesible en **`/api-docs`** (contrato del spec backend — esta unidad solo publica el puerto, no redefine rutas).

- **REQ-7.4 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` servir el frontend estático en el puerto **80** del contenedor nginx.

- **REQ-7.5 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` todos los servicios están en ejecución
  - `EL SISTEMA DEBE` permitir al operador abrir `http://<host>:<puerto_frontend>/` y recibir la SPA, y abrir `http://<host>:8000/api-docs` para la documentación OpenAPI.

---

### REQ-08: Reinicios idempotentes

**Descripción:** arranques repetidos no deben exigir intervención manual ni destruir datos persistidos por defecto.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-8.1 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` el operador ejecuta `docker compose down` seguido de `docker compose up` sin eliminar volúmenes
  - `EL SISTEMA DEBE` recuperar los datos existentes en PostgreSQL y completar el ciclo migrate → backend → frontend sin pasos manuales.

- **REQ-8.2 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` el operador ejecuta `docker compose up` por segunda vez sin cambios en migraciones
  - `EL SISTEMA DEBE` completar el contenedor `migrate` exitosamente (yoyo no re-aplica migraciones ya registradas).

- **REQ-8.3 (Excepción o Manejo de Invalidez):**
  - `SI` el operador elimina explícitamente el volumen de datos (`docker volume rm` o `docker compose down -v`)
  - `EL SISTEMA DEBE` comportarse como primer arranque: db vacía, migraciones aplicadas desde cero, backend y frontend operativos tras el ciclo completo.

---

### REQ-09: Aceptación end-to-end (E2E)

**Descripción:** criterio verificable de que la orquestación cumple su propósito cross-unidad.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-9.1 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` un operador con Docker Compose V2 ejecuta `docker compose up` desde `apps/infrastructure/` en una máquina limpia (sin contenedores previos del proyecto) con `.env` configurado
  - `EL SISTEMA DEBE` levantar las **cuatro capas** (db, migrate, backend, frontend) **sin intervención manual** entre ellas.

- **REQ-9.2 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` el arranque E2E completa
  - `EL SISTEMA DEBE` permitir verificar: (a) frontend responde HTTP en su puerto publicado, (b) backend responde en puerto 8000, (c) `/api-docs` es accesible, (d) el backend puede conectarse a PostgreSQL (sin error de conexión en logs de arranque).

- **REQ-9.3 (Flujo Principal / Basado en Eventos):**
  - `CUANDO` se repite el escenario E2E en **arranque posterior** (volumen de db ya existente)
  - `EL SISTEMA DEBE` igualmente completar las cuatro capas sin intervención manual.

- **REQ-9.4 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` ser la responsable designada de la E2E cross-unidad `docker compose up` completo; las unidades db, backend y frontend validan sus propios tests unitarios/integración, no sustituyen esta E2E.

---

### REQ-10: Documentación de comandos y operación

**Descripción:** el operador debe encontrar instrucciones claras para levantar, detener y reconstruir el stack.

#### Criterios de Aceptación y Comportamiento del Sistema (Sintaxis EARS)

- **REQ-10.1 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` documentar en el README del proyecto (raíz) o en un README dedicado en `apps/infrastructure/` al menos los comandos: `docker compose up`, `docker compose up --build`, `docker compose down`, y la ubicación del `.env.example`.

- **REQ-10.2 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` documentar los puertos publicados al host (frontend y backend) y las URLs de acceso (`/`, `/api-docs`, prefijo `/api/v1`).

- **REQ-10.3 (Comportamiento Siempre Activo / Ubicuo):**
  - `EL SISTEMA DEBE` documentar las variables de entorno obligatorias y un flujo mínimo de primer uso: copiar `.env.example` → `.env`, ajustar valores, ejecutar `docker compose up`.

- **REQ-10.4 (Excepción o Manejo de Invalidez):**
  - `EL SISTEMA DEBE` documentar qué ocurre si migrate falla (backend no arranca; revisar logs de `migrate`) y cómo reiniciar de forma segura.

---

## Edge Cases & Boundary Conditions

| ID | Escenario | Comportamiento esperado |
|----|-----------|-------------------------|
| **EC-INF-01** | **Primer arranque** — volumen PostgreSQL vacío, imágenes no construidas | `docker compose up` (o `up --build`) crea volumen, db healthy, migrate aplica todas las migraciones de `apps/db/migrations/`, backend conecta, frontend sirve SPA; sin pasos manuales. |
| **EC-INF-02** | **Reinicio con volumen existente** — datos ya presentes, esquema ya migrado | db arranca con datos intactos; migrate completa idempotentemente; backend y frontend arrancan normalmente. |
| **EC-INF-03** | **Idempotencia de migrate** — `yoyo apply --batch` sobre BD ya migrada | Contenedor migrate termina con código 0; no re-ejecuta SQL ya aplicado; backend puede arrancar. |
| **EC-INF-04** | **Migrate falla** (SQL inválido, db inaccesible) | migrate exit ≠ 0; backend NO arranca; frontend NO debe quedar operativo contra API inexistente; logs de migrate muestran causa. |
| **EC-INF-05** | **Backend lento en arrancar** | frontend no debe aceptar tráfico útil hasta cumplir dependencia de backend; operador consulta logs si frontend carga pero API falla. |
| **EC-INF-06** | **`docker compose down` sin `-v`** | Volúmenes persisten; siguiente `up` conserva datos. |
| **EC-INF-07** | **`docker compose down -v` o borrado manual de volumen** | Equivalente a primer arranque; migrate recrea esquema desde cero. |
| **EC-INF-08** | **Variables de entorno faltantes o `.env` ausente** | Fallo explícito en arranque o en servicio afectado; documentación indica variables requeridas. |
| **EC-INF-09** | **`VITE_API_BASE_URL` incorrecta** (URL interna de Docker no resoluble desde navegador) | Frontend carga pero peticiones API fallan en navegador; se corrige configurando URL al host publicado del backend (p. ej. `http://localhost:8000`). |
| **EC-INF-10** | **`CORS_ORIGINS` no incluye origen del frontend** | Navegador bloquea peticiones cross-origin; se corrige incluyendo el origen exacto del frontend en `CORS_ORIGINS`. |
| **EC-INF-11** | **Puerto 8000 u 80 ya ocupados en el host** | Compose falla al publicar puertos o documenta variables para cambiar mapeo de puertos host. |
| **EC-INF-12** | **Dockerfiles de backend/frontend aún no existen** (dependencia de unidad anterior incompleta) | `docker compose up --build` falla en build; se resuelve completando specs backend/frontend — fuera de responsabilidad de infraestructura aislar el fallo más allá de documentar dependencias. |

---

## Restricciones Operativas y de Cumplimiento (Nivel Negocio)

- **Entorno objetivo:** desarrollo y evaluación **local** con Docker Compose V2; no sustituye un pipeline de producción en cloud ni Kubernetes.

- **Prerrequisitos del operador:** Docker Engine con plugin Compose V2 (`docker compose version` funcional); permisos para crear volúmenes y publicar puertos en localhost.

- **Dependencias de unidades:** IMPLEMENT de esta unidad no puede cerrarse hasta que existan Dockerfiles construibles en `apps/backend/` y `apps/frontend/`, y migraciones en `apps/db/migrations/` — conforme al orden multi-unidad `db → backend → frontend → infrastructure`.

- **Seguridad local:** credenciales solo en `.env` no comiteado; compose comiteado usa sustitución de variables `${VAR}` sin valores por defecto secretos.

- **Continuidad operativa:** el flujo estándar de recuperación tras error es revisar logs del servicio fallido (`migrate`, `backend`) y re-ejecutar `docker compose up`; no se exigen runbooks de producción.

- **Evaluación TrycoreColombia:** cumplir el criterio de entorno reproducible con un comando alinea la infraestructura con la expectativa de evaluación del proyecto base (OpenAPI en `/api-docs`, stack containerizado).

- **Sin scripts wrapper obligatorios:** decisión cerrada por IDEA — `docker compose` es el contrato multiplataforma; cualquier script auxiliar futuro requeriría escalación explícita fuera de este spec.

---

> **Reglas de redacción:** este documento habla el lenguaje del negocio y del stakeholder en lo referente a objetivos y valor; nombra explícitamente artefactos de su dominio funcional (`compose.yaml`, servicios Docker, variables de entorno, puertos) porque la orquestación **es** su responsabilidad. Los nombres de sintaxis (`REQ`, `RN-INF`, `EC-INF`) se mantienen en inglés por estándar; todo el contenido se redacta en español. Para aprobar este spec, el USUARIO no necesita leer `design.md` ni `tasks.md`.
