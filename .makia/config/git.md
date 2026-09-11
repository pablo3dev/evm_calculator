# Configuración de Git — evm_calculator

Esta configuración es la referencia vinculante para el manejo de ramas y commits
del proyecto. Fuente: sección "Gitflow estricto" de `.makia/docs/project/draft_base.md`,
resuelta contra el esquema interno de ramas de MakIA (`orchestrator/session.md`) por
decisión explícita del USUARIO: **no se crean ramas `develop`/`feature/*` adicionales
— las ramas que MakIA ya crea por diseño cumplen esos roles.**

## Mapeo de roles (sin ramas nuevas)

| Rol exigido por el proyecto | Rama real que lo cumple |
| --- | --- |
| `main` (producción) | `main` — solo recibe la promoción final (RN-06 de `session.md`), nunca vía la rama `develop` legada. |
| `develop` (integración) | `makia/dev/<idea-slug>` — rama de consolidación de la idea. |
| `feature/*` (una por funcionalidad) | `makia/<tipo>/<spec-slug>` (`tipo` ∈ `nuevo`/`actualizacion`/`correccion`) — una por spec/unidad (DB, backend, frontend, infraestructura). |
| `release/*` (gate obligatorio antes de `main`) | Rama `release/<idea-slug>` creada desde `makia/dev/<idea-slug>` como paso previo al squash-merge a `main` dentro de la promoción (RN-06 paso 4). |

La rama `develop` que ya existe en el repositorio queda en desuso a partir de esta
configuración: no vuelve a recibir merges. Se conserva sin borrar hasta que el USUARIO
confirme su eliminación.

## Flujo de integración

1. Cada spec o unidad (DB, backend, frontend, infraestructura) se desarrolla en su
   propia rama `makia/<tipo>/<spec-slug>`, creada según `session.md` RN-02.
2. Esa rama se integra a `makia/dev/<idea-slug>` mediante Pull Request (nunca merge
   directo), aunque se trabaje en solitario — sustituye al squash-merge directo por
   defecto de MakIA (RN-04).
3. Antes de mergear a `makia/dev/<idea-slug>`, `release/<idea-slug>` o `main`, se
   presenta el resumen de cambios y se espera confirmación explícita del USUARIO.
4. Al cerrar todos los specs de la idea, se crea `release/<idea-slug>` desde
   `makia/dev/<idea-slug>` como paso previo obligatorio dentro de la promoción
   (RN-06). `main` solo recibe el squash-merge final desde `release/<idea-slug>`,
   nunca directo desde `makia/dev/<idea-slug>`.

## Formato de mensajes de commit

- Imperativo y descriptivo. Ejemplos válidos:
  - `Add EVM calculation service`
  - `Fix CPI edge case when AC is zero`
- No son aceptables mensajes como `fix`, `cambios` o `wip`.
- Se mantiene también la convención interna de MakIA `makia(<slug>): ...` para los
  commits de consolidación automática (squash-merges, artefactos de IDEA/SPEC) —
  no sustituye al formato imperativo anterior, aplica en paralelo para esos commits
  puntuales.
