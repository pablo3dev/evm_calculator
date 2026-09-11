# Specs: apps/infrastructure

> Orquestación Docker Compose del stack completo de EVM Project Tool.

## Grafo de specs

```mermaid
graph LR
  backend[evm-project-tool-backend<br/>apps/backend]
  frontend[evm-project-tool-frontend<br/>apps/frontend]
  infra[evm-project-tool-infrastructure]
  backend --> infra
  frontend --> infra
```

## Tabla de specs

| Spec | Estado | Creación | Paralelizable con | Ruta | Depende de |
|---|:---:|:---:|:---:|---|---|
| evm-project-tool-infrastructure | `Completado` | `Aprobado` | `D` | `evm-project-tool-infrastructure/summary.md` | `../../backend/evm-project-tool-backend/summary.md`, `../../frontend/evm-project-tool-frontend/summary.md` |
