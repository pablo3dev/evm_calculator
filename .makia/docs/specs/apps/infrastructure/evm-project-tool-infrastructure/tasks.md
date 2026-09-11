# Implementation Tasks: EVM Project Tool Infrastructure

## 1. Metadata & Traceability
- **Spec:** `evm-project-tool-infrastructure`
- **Requirements Ref:** `requirements.md` (spec: `evm-project-tool-infrastructure`)
- **Design Ref:** `design.md` (spec: `evm-project-tool-infrastructure`)

`[P]`: puede ejecutarse en paralelo (archivos distintos, sin dependencias entre sí dentro de la misma fase).

> **Nota footprint:** este spec **no** incluye tarea de `lefthook.yml` — la unit-spec db (`evm-project-tool-db`, Tarea 1.1) ya cubre verificación pre-commit transversal; documentado en `design.md` §2.5.

> **Dependencias multi-unidad:** este spec es la **4.ª unidad** del ciclo `db → backend → frontend → infrastructure`. Requiere que las unidades hermanas estén implementadas **suficientemente** para exponer: (a) migraciones SQL en `apps/db/migrations/`, (b) `Dockerfile` construible en `apps/backend/`, (c) `Dockerfile` construible en `apps/frontend/`. IMPLEMENT no debe iniciar Fase 3 hasta confirmar builds locales de esas tres unidades. El `compose.yaml` **construye** contextos hermanos (`../db`, `../backend`, `../frontend`) pero **no modifica** su código fuente.

---

## 2. Execution Guidelines
- **Sequential Ordering:** ejecutar las fases en orden estricto (Fase 1 → 2 → 3 → 4); dentro de cada fase, respetar dependencias entre tareas (p. ej. 3.2 depende de 2.1 y 3.1; 3.3 depende de 3.2).
- **Test-Verified:** cada funcionalidad debe tener su prueba correspondiente antes de marcarse `[x]` — para esta unidad, la verificación principal es **E2E con Docker Compose** (`design.md` §8), no suites unitarias propias.
- **Traceability Tags:** cada tarea referencia su origen en `requirements.md` (ej. `[REQ-01]`) y su componente en `design.md` (ej. `[DESIGN §4]`).
- **Dependencia externa:** requiere specs hermanos `evm-project-tool-db`, `evm-project-tool-backend` y `evm-project-tool-frontend` con footprint mínimo construible antes de Fase 3 y verificación E2E de Fase 4.

---

## 3. Phase Breakdown & Actionable Tasks

### Fase 1: Footprint, variables de entorno y gitignore
- [ ] **Tarea 1.1: Estructura base `apps/infrastructure/`** `[REQ-03]` `[DESIGN §5]` — crear el directorio raíz de la unidad y la subcarpeta `migrate/` según el mapa de `design.md` §5 (`compose.yaml`, `.env.example`, `.gitignore`, `migrate/Dockerfile`, `README.md` opcional). Sin modificar archivos fuera de `apps/infrastructure/` salvo consumo por rutas de build en `compose.yaml`.
- [ ] **Tarea 1.2: `.env.example` con variables documentadas** `[REQ-03]` `[REQ-04]` `[RN-INF-02]` `[DESIGN §4]` — crear `.env.example` listando **todas** las variables cerradas en `design.md` §4: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL` (formato `postgresql+psycopg://…` compatible con yoyo 9.0.0), `CORS_ORIGINS` (incluir origen del navegador, p. ej. `http://localhost:8080`), `VITE_API_BASE_URL` (p. ej. `http://localhost:8000/api/v1`), `LOG_LEVEL`. Valores de ejemplo seguros para desarrollo local; **sin** credenciales reales de producción.
- [ ] **Tarea 1.3: `.gitignore` de secretos locales** `[REQ-03]` `[RN-INF-02]` `[DESIGN §5]` `[DESIGN §7]` — crear `apps/infrastructure/.gitignore` ignorando `.env` (y variantes locales si aplica), **sin** ignorar `.env.example`. Confirmar que ningún archivo `.env` con secretos reales queda trackeado por git.

### Fase 2: Dockerfile del runner de migraciones
- [ ] **Tarea 2.1: `migrate/Dockerfile` (Python 3.14 + yoyo 9.0.0)** `[REQ-02]` `[DESIGN §5]` `[DESIGN §4]` — implementar imagen mínima basada en Python 3.14 con `yoyo-migrations==9.0.0` instalado, `WORKDIR` adecuado y `CMD ["yoyo", "apply", "--batch"]`. Sin lógica de aplicación ni DDL propio — solo runner de migraciones.
- [ ] **Tarea 2.2: Acceso a `apps/db/migrations/` desde el runner** `[REQ-02]` `[DESIGN §4]` `[DESIGN §5]` — configurar el acceso a las migraciones hermanas mediante **bind mount en `compose.yaml`** (recomendado en runtime) o `COPY` desde contexto de build que incluya `../db/migrations`, de modo que yoyo encuentre los scripts SQL de `evm-project-tool-db`. Documentar en comentario del Dockerfile o en `README.md` la estrategia elegida (debe coincidir con `design.md` §4).
- [ ] **Tarea 2.3: Verificar build y ejecución aislada del runner migrate** `[REQ-02]` `[EC-INF-01]` `[EC-INF-03]` `[DESIGN §8]` — construir la imagen `migrate` y ejecutar `yoyo apply --batch` contra una instancia PostgreSQL 18 vacía y healthy (puede ser contenedor temporal fuera del compose final). Confirmar que las tablas `projects` y `activities` quedan creadas sin error. Re-ejecutar `yoyo apply --batch` y confirmar idempotencia (EC-INF-03).

### Fase 3: `compose.yaml` — cuatro servicios orquestados
- [ ] **Tarea 3.1: Servicio `db` (PostgreSQL 18 + healthcheck)** `[REQ-04]` `[REQ-05]` `[DESIGN §4]` — definir servicio `db` con imagen `postgres:18`, variables `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` desde `.env`, volumen persistente para datos, puerto interno 5432 (sin publicar al host salvo necesidad de debug documentada), y `healthcheck` con `pg_isready` hasta estado `healthy`.
- [ ] **Tarea 3.2: Servicio `migrate` (one-shot, orden respecto a `db`)** `[REQ-01]` `[REQ-02]` `[RN-INF-01]` `[RN-INF-03]` `[EC-INF-04]` `[DESIGN §4]` — definir servicio `migrate` que construye `apps/infrastructure/migrate/`, usa `depends_on` de `db` con `condition: service_healthy`, política de reinicio `no` (contenedor one-shot), inyecta `DATABASE_URL` (o configuración yoyo equivalente) y ejecuta `yoyo apply --batch`. El servicio debe terminar con código 0 antes de que arranque `backend`.
- [ ] **Tarea 3.3: Servicio `backend` (build hermano + dependencia post-migrate)** `[REQ-04]` `[REQ-02]` `[RN-INF-03]` `[EC-INF-04]` `[DESIGN §4]` — definir servicio `backend` con `build` apuntando al `Dockerfile` de `apps/backend/`, `depends_on` de `migrate` con `condition: service_completed_successfully`, variables `DATABASE_URL`, `CORS_ORIGINS`, `LOG_LEVEL`, publicación `8000:8000`, y healthcheck opcional contra `GET /api-docs` o `GET /api/v1/projects` según `design.md` §4.
- [ ] **Tarea 3.4: Servicio `frontend` (build hermano + proxy nginx)** `[REQ-04]` `[REQ-01]` `[DESIGN §4]` — definir servicio `frontend` con `build` apuntando al `Dockerfile` de `apps/frontend/`, `build-arg`/`environment` `VITE_API_BASE_URL` alineado con el backend expuesto al navegador del host, `depends_on` de `backend` (mínimo `service_started`; preferible healthcheck si backend lo expone), publicación `8080:80` (nginx). Sin redefinir lógica de UI — solo orquestación.

### Fase 4: Verificación E2E y documentación
- [ ] **Tarea 4.1: Primer arranque E2E (`docker compose up`)** `[REQ-01]` `[REQ-06]` `[EC-INF-01]` `[DESIGN §8]` — desde `apps/infrastructure/`, con `.env` copiado desde `.env.example`, ejecutar `docker compose up --build` (o equivalente documentado) **sin intervención manual** entre servicios. Verificar orden db → migrate (exit 0) → backend → frontend; confirmar `http://localhost:8000/api-docs` responde y `http://localhost:8080` sirve la SPA. Registrar evidencia mínima (logs o checklist TEST).
- [ ] **Tarea 4.2: Segundo arranque idempotente (volumen existente)** `[REQ-05]` `[REQ-06]` `[EC-INF-02]` `[EC-INF-03]` `[DESIGN §8]` — tras el primer arranque, ejecutar `docker compose down` **sin** eliminar el volumen de datos de PostgreSQL; volver a `docker compose up`. Confirmar que `migrate` completa sin error (migraciones ya aplicadas), `backend` y `frontend` levantan, y no se requieren pasos manuales de reparación de esquema.
- [ ] **Tarea 4.3: `README.md` con comandos operativos** `[REQ-07]` `[DESIGN §5]` — crear `apps/infrastructure/README.md` mínimo con: copia `.env.example` → `.env`, `docker compose up --build`, `docker compose down`, consulta de logs (`docker compose logs -f`), y nota de puertos host (`8080` frontend, `8000` backend). Sin duplicar documentación de negocio de otras unidades.

---

## 4. Execution Progress Tracker
| Fase | Total Tareas | Completadas | Estado |
|:---|:---:|:---:|:---|
| Fase 1: Footprint, variables de entorno y gitignore | 3 | 0 | `Pending` |
| Fase 2: Dockerfile del runner de migraciones | 3 | 0 | `Pending` |
| Fase 3: `compose.yaml` — cuatro servicios orquestados | 4 | 0 | `Pending` |
| Fase 4: Verificación E2E y documentación | 3 | 0 | `Pending` |
| **Total Global** | **13** | **0** | **0%** |

---

## 5. Definition of Done (DoD) Gate
- [ ] Todas las tareas están marcadas como completadas (`[x]`).
- [ ] Todos los criterios EARS de `requirements.md` (REQ-01..REQ-07) pasan las pruebas asociadas.
- [ ] Reglas RN-INF-01..RN-INF-03 verificadas; edge cases EC-INF-01..EC-INF-04 cubiertos en verificación E2E de Fase 4.
- [ ] La estructura de archivos coincide con el mapeo de `design.md` §5 (footprint exclusivo `apps/infrastructure/`).
- [ ] `docker compose up` funciona en **primer arranque** (Tarea 4.1) y en **segundo arranque con volumen existente** (Tarea 4.2), sin intervención manual entre servicios.
- [ ] **No hay secretos reales comiteados** — `.env` ignorado, `.env.example` sin credenciales de producción.
- [ ] La fila del spec en el `INDEX.md` de specs (`.makia/docs/specs/apps/infrastructure/INDEX.md`) está sincronizada con el `Estado global` de `summary.md`.

---

> IMPLEMENT ejecuta este documento tarea por tarea. Cada tarea se valida con un TEST acotado a sus propios archivos (no la suite completa) antes de marcarse `[x]`. Máximo 2 iteraciones de corrección por tarea antes de cancelar y escalar (ver sub-orchestrator.md del Orquestador).
