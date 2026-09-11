# Specs: apps/backend

> API REST y lógica de negocio EVM.

## Grafo de specs

```mermaid
graph LR
  DM[domain-model.md] --> S1[evm-project-tool-backend]
  DB[(evm-project-tool-db<br/>apps/db)] --> S1
```

## Tabla de specs

| Spec | Estado | Creación | Paralelizable con | Ruta | Depende de |
|---|:---:|:---:|:---:|---|---|
| [evm-project-tool-backend] | `Pendiente` | `Aprobado` | `B` | `evm-project-tool-backend/summary.md` | `../../db/evm-project-tool-db/summary.md` |
