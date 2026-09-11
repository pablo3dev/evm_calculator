# EVM Project Tool

Herramienta interna para registrar proyectos y actividades y ver indicadores de Valor Ganado (EVM/PMI): PV, EV, CV, SV, CPI, SPI, EAC y VAC, por actividad y consolidados por proyecto.

El backend calcula los indicadores en cada lectura. El frontend solo presenta los datos. PostgreSQL persiste proyectos y actividades.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) con Compose V2 (`docker compose`)

## Levantar el proyecto

Desde la raíz del repositorio:

```bash
cd apps/infrastructure
cp .env.example .env
docker compose up --build
```

En Windows (PowerShell):

```powershell
cd apps\infrastructure
Copy-Item .env.example .env
docker compose up --build
```

El orden de arranque es automático: base de datos → migraciones → API → interfaz.

| URL | Qué es |
| --- | --- |
| http://localhost:8080 | Aplicación (dashboard) |
| http://localhost:8000/api-docs | Documentación OpenAPI (Swagger) |
| http://localhost:8000/api/v1 | API REST |

PostgreSQL no se publica en el host; solo lo usan los contenedores.

En segundo plano: `docker compose up --build -d`.

## Detener

Desde `apps/infrastructure/`:

```bash
docker compose down
```

Para borrar también los datos locales de PostgreSQL:

```bash
docker compose down -v
```

## Variables de entorno

Copia `apps/infrastructure/.env.example` a `.env`. Los valores de ejemplo sirven para desarrollo local. No commitees `.env`.

| Variable | Uso |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Credenciales de PostgreSQL |
| `DATABASE_URL` | Conexión de migraciones y backend (`postgresql://…@db:5432/…`) |
| `CORS_ORIGINS` | Origen del frontend (`http://localhost:8080`) |
| `VITE_API_BASE_URL` | URL de la API vista desde el navegador (`http://localhost:8000/api/v1`) |
| `LOG_LEVEL` | Nivel de log del backend |

Detalle operativo y troubleshooting: `apps/infrastructure/README.md`.

## Pruebas (opcional, por unidad)

```bash
# Backend (desde apps/backend)
uv sync --group dev
uv run pytest tests/unit tests/integration --cov=evm_project_tool.domain --cov=evm_project_tool.application --cov-fail-under=80

# Frontend (desde apps/frontend)
npm ci
npm test
npm run build
```

## Documentación de producto

Specs y modelo de dominio: `.makia/docs/`.
