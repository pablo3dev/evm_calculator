# Learning — evm-project-tool

Material de referencia técnica crudo, recopilado por LEARN, para consumo directo de CODE durante IMPLEMENT (sin volver a consultar Context7).

## Python 3.14

- Estado: ESTABLE. Versión fijada del proyecto: **3.14.7** (release de mantenimiento, sobre 3.14.0 final liberado 2025-10-07).
- Fuente: python.org/downloads/release/python-3147/, PEP 745.

## FastAPI

- Versión fijada: **0.141.1** (PyPI, 2026-07-29).
- Fuente: PyPI, Context7 `/websites/fastapi_tiangolo`.
- App: `from fastapi import FastAPI; app = FastAPI()`
- Router: definir con `APIRouter()` en módulo separado, registrar con `app.include_router(users_router)`.
- Modelos Pydantic: `class Item(BaseModel): name: str; price: float`, usados como `response_model=...` y parámetro de body de un endpoint.
- Docs automáticos por defecto: Swagger UI en `/docs`, ReDoc en `/redoc`.
- Customización de rutas de docs (necesario para este proyecto, que exige `/api-docs` o `/swagger-ui`): `FastAPI(docs_url="/api-docs", redoc_url="/swagger-ui")` (o `redoc_url=None` para deshabilitar ReDoc).

### Gaps conocidos (no resueltos, no inventar)

- No se confirmó directamente el classifier de compatibilidad Python 3.14 en los metadatos del paquete. Si CODE encuentra un error real de instalación/ejecución bajo 3.14, no debe improvisar una solución: escala el gap a su LANZADOR (IMPLEMENT).

## uv (Astral)

- Versión fijada: **0.12.9**.
- Fuente: GitHub releases astral-sh/uv, Context7 `/astral-sh/uv`.
- `uv init <nombre>` — inicializa proyecto (app por defecto).
- `uv add <paquete>` — agrega dependencia, crea `.venv` si no existe.
- `uv run <comando>` — ejecuta dentro del entorno del proyecto (p. ej. `uv run ruff check`, `uv run fastapi run`).
- `uv lock` / `uv sync` — resuelve y sincroniza el lockfile.
- Patrón Dockerfile multi-stage (Context7 `/astral-sh/uv-docker-example`, fuente oficial `github.com/astral-sh/uv-docker-example`):
  - Imagen base de build: `FROM ghcr.io/astral-sh/uv:python3.14-trixie-slim` (ajustar tag al 3.14 fijado).
  - Variables clave: `UV_COMPILE_BYTECODE=1`, `UV_LINK_MODE=copy`, `UV_NO_DEV=1`.
  - Cache de dependencias con BuildKit:
    ```dockerfile
    RUN --mount=type=cache,target=/root/.cache/uv \
        --mount=type=bind,source=uv.lock,target=uv.lock \
        --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
        uv sync --locked --no-install-project
    COPY . /app
    RUN --mount=type=cache,target=/root/.cache/uv uv sync --locked
    ```
  - Stage final de producción: copiar `/app` (venv + proyecto) desde el stage builder a una imagen limpia `python:3.14-slim-trixie`, usuario no-root, `ENV PATH="/app/.venv/bin:$PATH"`, `CMD ["fastapi", "run", "--host", "0.0.0.0", "<módulo de la app>"]`.

## yoyo-migrations

- Versión fijada: **9.0.0** (PyPI, 2024-08-10).
- Fuente: PyPI JSON API, ollycope.com/software/yoyo/latest/.
- Migración de aplicación: archivo `migrations/0001.create-foo.sql` → SQL puro, p. ej. `CREATE TABLE foo (id INT, bar VARCHAR(20), PRIMARY KEY (id));`.
- Migración de rollback (opcional): `migrations/0001.create-foo.rollback.sql` → `DROP TABLE foo;`.
- Dependencias entre migraciones: comentario `-- depends: 0000.initial-schema 0001.create-foo` dentro del archivo SQL.
- Comando de aplicación: `yoyo apply` (interactivo; `--batch` para no interactivo, recomendado para Docker/CI).
- Conexión PostgreSQL vía psycopg3: cadena `postgresql+psycopg://user:pass@host/db`.

### Gaps conocidos (no resueltos, no inventar)

- No declara `requires_python` en metadatos PyPI; último release 2024-08-10 (~2 años sin publicar). No hay evidencia de incompatibilidad con 3.14, pero tampoco confirmación explícita. Si CODE encuentra un error real de instalación/ejecución bajo 3.14, no debe improvisar una solución alternativa (cambiar de librería de migraciones, por ejemplo): escala el gap a su LANZADOR (IMPLEMENT) — cambiar la librería de migraciones es una decisión de arquitectura de IDEA, no de CODE.

## psycopg3 (paquete PyPI `psycopg`)

- Versión fijada: **3.2.10**.
- Fuente: Context7 `/psycopg/psycopg`.
- Recomendado sobre psycopg2 (legacy, sigue mantenido pero no es la opción activa recomendada).
- Patrón de pool y ejecución:
  ```python
  from psycopg_pool import ConnectionPool
  with ConnectionPool(conninfo, min_size=4, max_size=None) as pool:
      with pool.connection() as conn:
          with conn.cursor() as cur:
              cur.execute("SELECT something FROM somewhere")
  ```
- SQL parametrizado seguro (prevención de inyección SQL — obligatorio, nunca interpolar strings con `%` de Python):
  ```python
  cur.execute("INSERT INTO authors (name) VALUES (%s)", ("O'Reilly",))
  ```

## PostgreSQL

- Versión fijada: imagen Docker oficial **`postgres:18`** (build 18.6).
- Fuente: hub.docker.com/_/postgres.
- UUID: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` (función nativa desde PG13, no requiere `CREATE EXTENSION pgcrypto` para este uso específico).
- Fechas: `TIMESTAMPTZ` (`TIMESTAMP WITH TIME ZONE`), p. ej. `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.

## ruff (linter/formatter Python)

- Versión fijada: **0.16.3**.
- Fuente: PyPI, GitHub astral-sh/ruff.
- Comandos: `ruff check <path>` (lint), `ruff format <path>` (formato, sustituye a black). Integrado vía `uv run ruff check` / `uv run ruff format`.

## React / Node.js

- Versiones fijadas: React **19.3.0**, Node.js **24 LTS ("Krypton", v24.21.0, activo hasta 2028-05-31)**.
- Fuente: registry.npmjs.org, nodejs.org/en/about/previous-releases.

## TypeScript

- Versión fijada: **7.0.2**.
- Fuente: Context7 `/microsoft/typescript`, devblogs.microsoft.com/typescript.

## Vite

- Versión fijada: **8.0.10**. Requiere Node.js 20.19+ o 22.12+ (Node 24 LTS lo cumple).
- Fuente: Context7 `/websites/vite_dev`, `/vitejs/vite`.
- Scaffolding: `npm create vite@latest <nombre-app> -- --template react-ts`.
- Estructura generada: `index.html`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `public/`.
- Variables de entorno expuestas al cliente: solo las prefijadas `VITE_`, vía `import.meta.env.VITE_KEY`. Ejemplo verbatim:
  ```
  # .env
  VITE_API_BASE_URL=http://localhost:8000
  ```
  ```ts
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  ```
- Proxy de dev server hacia el backend (evita CORS en desarrollo), ejemplo verbatim adaptado:
  ```ts
  // vite.config.ts
  export default defineConfig({
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  })
  ```

## Librería de gráficos

- Elegida por IDEA: **Recharts, versión fijada 3.10.1** (React-first, SVG, descrita en fuentes 2026 como opción por defecto para dashboards React; sin incompatibilidad reportada con React 19).
- Alternativas investigadas y descartadas por IDEA (documentar solo como referencia, CODE usa Recharts): react-chartjs-2 5.3.1 (wrapper de Chart.js 4.5.1, renderizado Canvas), Victory 37.3.6 (paridad React Native).
- Fuente: registry.npmjs.org.

## ESLint + Prettier (linter/formatter TypeScript/React)

- Versiones fijadas: ESLint **10.10.0** (flat config, `eslint.config.js`), Prettier **3.9.6**.
- Elegidos por IDEA sobre Biome por tener evidencia de fuente primaria de mayor confianza y ser el estándar más documentado/establecido para este proyecto nuevo.
- Fuente: registry.npmjs.org.

## Docker multi-stage (frontend)

- Patrón: Stage 1 build con `node:24-slim` (evitar `node:24-alpine` por riesgo de fallos silenciosos con dependencias nativas bajo musl libc) → `npm ci && npm run build` (genera `dist/`). Stage 2 runtime: copiar `dist/` a imagen `nginx:stable-alpine` para servir estático.
- Fuente: docker.com/blog/how-to-dockerize-react-app, oneuptime.com.

## Docker Compose V2

- Formato `compose.yaml`, comando `docker compose` (sin guion). Arranque ordenado con `depends_on.condition`:
  ```yaml
  services:
    db:
      image: postgres:18
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U postgres"]
        interval: 10s
        timeout: 5s
        retries: 5
        start_period: 20s
    migrate:
      build: ./apps/backend
      depends_on:
        db:
          condition: service_healthy
    backend:
      build: ./apps/backend
      depends_on:
        migrate:
          condition: service_completed_successfully
    frontend:
      build: ./apps/frontend
      depends_on:
        backend:
          condition: service_started
  ```
- Valores válidos de `condition`: `service_started`, `service_healthy`, `service_completed_successfully`.
- Fuente: docs.docker.com/compose/how-tos/startup-order.

## lefthook

- Versión fijada: **2.1.12**.
- Sintaxis EXACTA resuelta contra la plantilla propia de MakIA ya existente en el proyecto (`.makia/core/harness/templates/lefthook.example.yml`, fuente interna autoritativa — no externa): el campo raíz de comandos es `commands:` (no `jobs:`), cada comando admite `root:`, `glob:`, `run:`; la sección `pre-commit` admite `parallel: true`.

### Gaps conocidos (no resueltos, no inventar)

- La investigación externa (docs de lefthook.dev) encontró evidencia de menor confianza que mencionaba un posible campo `jobs:` en algunas versiones — descartado a favor de la plantilla interna de MakIA como fuente de verdad para este proyecto.

## Requisitos de formato de archivos de plataforma (Windows/POSIX)

Este proyecto NO genera scripts wrapper de plataforma (`.cmd`/`.bat`/`.ps1`) como parte de su alcance — usa `docker compose` como único punto de entrada multiplataforma. Si en IMPLEMENT surge la necesidad de un script auxiliar (`.sh`/`.cmd`), CODE debe escalar a su LANZADOR antes de generarlo, para que se investiguen los requisitos de formato (CRLF/LF, encoding, BOM, bit de ejecución) — no está cubierto en este `learning.md` porque no era parte del alcance identificado.

## Gaps conocidos globales (no resueltos, no inventar)

- yoyo-migrations bajo Python 3.14: sin confirmación oficial explícita de compatibilidad (ver sección yoyo-migrations).
- FastAPI 0.141.1 bajo Python 3.14: sin confirmación directa del classifier exacto (ver sección FastAPI).

CODE no debe inventar una solución si encuentra estos gaps: escala a su LANZADOR (IMPLEMENT).
