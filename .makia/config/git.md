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
| `feature/*` (una por funcionalidad) | `feature/<spec-slug>` — máscara de `makia/<tipo>/<spec-slug>` cuando `tipo` ∈ `nuevo`/`actualizacion` (evolución de funcionalidad); misma unidad (DB, backend, frontend, infraestructura), creada desde `develop`. Integra a `develop` SIEMPRE vía Pull Request, nunca merge directo. |
| `fix/*` (una por corrección) | `fix/<spec-slug>` — máscara de `makia/<tipo>/<spec-slug>` cuando `tipo = correccion`; creada desde `develop`. Integra a `develop` SIEMPRE vía Pull Request, nunca merge directo, igual que `feature/*`. |
| `release/*` (gate obligatorio antes de `main`) | `release/*` (rama literal) creada desde `develop` como paso previo al merge a `main`. Integra a `main` SIEMPRE vía Pull Request — nunca merge directo ni push directo a `main`. |

## Flujo de integración

1. Cada spec o unidad (DB, backend, frontend, infraestructura) se desarrolla en su
   propia rama `feature/<spec-slug>` (si `tipo` es `nuevo`/`actualizacion`) o
   `fix/<spec-slug>` (si `tipo` es `correccion`) — máscara de `makia/<tipo>/<spec-slug>` —
   creada desde `develop`.
2. Esa rama (`feature/*` o `fix/*`) se integra a `develop` SIEMPRE mediante Pull
   Request — nunca `git merge` ni push directo — aunque se trabaje en solitario.
   Cualquier paso heredado de `session.md` que indique un merge/squash directo
   se sustituye en este proyecto por: abrir el Pull Request y esperar su
   aprobación/merge; el sub-agente nunca ejecuta el merge o push directo por
   su cuenta.
3. Antes de mergear a una rama protegida (`develop`, `release/*`, `main`), se
   presenta el resumen de cambios y se espera confirmación explícita del USUARIO.
4. Cuando el conjunto de specs a liberar está completo en `develop`, se crea
   `release/*` desde `develop` como paso previo obligatorio. `main` solo recibe
   merge desde una rama `release/*`, nunca directo desde `develop` ni desde
   `feature/<spec-slug>`/`fix/<spec-slug>` — y ese merge de `release/*` hacia
   `main` se hace SIEMPRE vía Pull Request, nunca merge directo ni push directo
   a `main`, sin excepción.

## Formato de mensajes de commit

- Imperativo y descriptivo. Ejemplos válidos:
  - `Add EVM calculation service`
  - `Fix CPI edge case when AC is zero`
- No son aceptables mensajes como `fix`, `cambios` o `wip`.
- Se mantiene también la convención interna de MakIA `makia(<slug>): ...` para los
  commits de consolidación automática que generan los sub-agentes (artefactos de
  IDEA/SPEC dentro de una rama `feature/<spec-slug>` o `fix/<spec-slug>`, máscara de
  `makia/<tipo>/<spec-slug>`) — no sustituye al formato imperativo anterior,
  aplica en paralelo para esos commits puntuales.

## Máscara de nombres de rama (fachada)

Este proyecto aplica una **fachada de nombres de rama** entre el esquema interno
de MakIA y las ramas físicas del repositorio. Es una sustitución 1:1 de string
en el nombre de la rama — no cambia ninguna otra lógica de MakIA.

- Toda vez que el flujo interno de MakIA (`session.md` RN-01/RN-02/RN-08, o
  cualquier sub-agente: SPEC, IMPLEMENT, etc.) indique crear una rama con el
  patrón `makia/<tipo>/<spec-slug>`, en este proyecto el prefijo físico depende
  del valor de `tipo` — el segmento `<tipo>` NO aparece literal como carpeta
  intermedia en el nombre de la rama; en su lugar, el propio prefijo ya lo
  codifica de forma estándar:

  | `tipo` | Prefijo físico | Rama física resultante |
  | --- | --- | --- |
  | `nuevo` | `feature/` | `feature/<spec-slug>` |
  | `actualizacion` | `feature/` | `feature/<spec-slug>` |
  | `correccion` | `fix/` | `fix/<spec-slug>` |

- Ejemplos concretos:
  - En vez de `git checkout -b makia/nuevo/evm-project-tool-backend`, se
    ejecuta `git checkout -b feature/evm-project-tool-backend`.
  - En vez de `git checkout -b makia/correccion/evm-project-tool-backend-hotfix`,
    se ejecuta `git checkout -b fix/evm-project-tool-backend-hotfix`.
- Esta máscara **no aplica** a los mensajes de commit (`makia(<spec-slug>): ...`
  se mantiene sin cambios) ni a ningún otro identificador interno
  (`<spec-slug>`, rutas de `.makia/docs/specs/`, `INDEX.md`, `git log --grep`).
  Solo cambia el nombre literal de la rama.
- La rama de idea (`makia/dev/<idea-slug>`) ya tiene su propia máscara resuelta
  y documentada arriba: es directamente la rama `develop` existente del repo
  (no `feature/dev/...` ni ningún otro nombre) — sin cambios a esa parte.
- `release/*` y `main` no tienen máscara: se usan literalmente esos nombres,
  tal como ya documenta la tabla de "Mapeo de roles".
- Todo merge de una rama enmascarada (`feature/*` o `fix/*`) hacia `develop`,
  y de `release/*` hacia `main`, se hace EXCLUSIVAMENTE vía Pull Request —
  nunca `git merge`/push directo, sin excepción, ni siquiera trabajando en
  solitario.
