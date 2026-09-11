# Configuración de Git — evm_calculator

Esta configuración es la referencia vinculante para el manejo de ramas y commits
del proyecto. Fuente: sección "Gitflow estricto" de `.makia/docs/project/draft_base.md`,
resuelta contra el esquema interno de ramas de MakIA (`orchestrator/session.md`) por
decisión explícita del USUARIO: **`develop` es la rama de consolidación única y
permanente del proyecto — no se crea una rama `makia/dev/<idea-slug>` por idea.**
Toda idea/desarrollo consolida directamente en la `develop` ya existente del repositorio.

## Mapeo de roles

| Rol exigido por el proyecto | Rama real que lo cumple |
| --- | --- |
| `main` (producción) | `main` — solo recibe merges desde `release/*`. Nunca merge directo de otra rama. |
| `develop` (integración, permanente) | `develop` (rama literal ya existente del repo) — sustituye al rol de `makia/dev/<idea-slug>` en el esquema interno de MakIA. |
| `feature/*` (una por funcionalidad) | `makia/<tipo>/<spec-slug>` (`tipo` ∈ `nuevo`/`actualizacion`/`correccion`) — una por spec/unidad (DB, backend, frontend, infraestructura), creada desde `develop`. |
| `release/*` (gate obligatorio antes de `main`) | `release/*` (rama literal) creada desde `develop` como paso previo al merge a `main`. |

## Flujo de integración

1. Cada spec o unidad (DB, backend, frontend, infraestructura) se desarrolla en su
   propia rama `makia/<tipo>/<spec-slug>`, creada desde `develop`.
2. Esa rama se integra a `develop` mediante Pull Request (nunca merge directo),
   aunque se trabaje en solitario.
3. Antes de mergear a una rama protegida (`develop`, `release/*`, `main`), se
   presenta el resumen de cambios y se espera confirmación explícita del USUARIO.
4. Cuando el conjunto de specs a liberar está completo en `develop`, se crea
   `release/*` desde `develop` como paso previo obligatorio. `main` solo recibe
   merge desde una rama `release/*`, nunca directo desde `develop` ni desde
   `makia/<tipo>/<spec-slug>`.

## Formato de mensajes de commit

- Imperativo y descriptivo. Ejemplos válidos:
  - `Add EVM calculation service`
  - `Fix CPI edge case when AC is zero`
- No son aceptables mensajes como `fix`, `cambios` o `wip`.
- Se mantiene también la convención interna de MakIA `makia(<slug>): ...` para los
  commits de consolidación automática que generan los sub-agentes (artefactos de
  IDEA/SPEC dentro de una rama `makia/<tipo>/<spec-slug>`) — no sustituye al
  formato imperativo anterior, aplica en paralelo para esos commits puntuales.
