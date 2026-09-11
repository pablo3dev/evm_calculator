# Specs: apps/frontend

> Dashboard React presentación EVM.

## Grafo de specs

```mermaid
graph LR
  S1[evm-project-tool-frontend] -->|depende de backend<br/>cross-unidad| BE[(evm-project-tool-backend<br/>apps/backend)]
```

## Tabla de specs

| Spec | Estado | Creación | Paralelizable con | Ruta | Depende de |
|---|:---:|:---:|:---:|---|---|
| [evm-project-tool-frontend] | `Pendiente` | `Aprobado` | `C` | `evm-project-tool-frontend/summary.md` | `../../backend/evm-project-tool-backend/summary.md` |
