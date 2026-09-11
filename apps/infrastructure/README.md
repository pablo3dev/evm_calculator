# Local stack (Docker Compose)

Run all commands from `apps/infrastructure/`.

## Setup

```bash
cp .env.example .env
```

Edit `.env` only if you need non-default values.

## Start

```bash
docker compose up --build
```

Add `-d` to run detached.

Startup order: `db` → `migrate` (one-shot) → `backend` → `frontend`.

## Host ports

| Port | Service  | Use                          |
|-----:|----------|------------------------------|
| 8080 | frontend | UI — http://localhost:8080   |
| 8000 | backend  | API / OpenAPI — http://localhost:8000 |

PostgreSQL (`db`) is internal only (not published to the host).

## Logs

```bash
docker compose logs -f
```

Append a service name to filter, e.g. `docker compose logs -f backend`.

## Stop

```bash
docker compose down
```

Reset the database volume (fresh PostgreSQL data):

```bash
docker compose down -v
```
