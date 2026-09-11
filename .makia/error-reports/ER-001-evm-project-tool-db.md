# ER-001 — evm-project-tool-db

- **Spec/idea afectado:** evm-project-tool-db (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-14 — "El USUARIO corrige o contradice, durante SPEC, una decisión que `draft.md` daba por cerrada"
- **Etapa:** IDEA -> SPEC (propagado por Orquestación)
- **Causa raíz:** CR-06 (Decisión de arquitectura no cerrada con precisión en `draft.md` — la convención de ruta de `domain-model.md` quedó fijada copiando un dato de entrada impreciso, sin verificación cruzada contra la regla ya vigente del propio framework). Secundaria: falla de verificación del Orquestador, que no contrastó el path de `draft_base.md` contra `spec.md` antes de delegarlo a IDEA/SPEC.
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

`draft_base.md` (documento del USUARIO, previo a IDEA) indicó una ruta imprecisa de ubicación de specs (`.makia/docs/apps/<unidad>/[specs]`) para las 4 unidades del proyecto. IDEA, al cerrar `draft.md`, copió ese mismo patrón impreciso para fijar la ruta de `domain-model.md` (`.makia/docs/apps/backend/domain-model.md`) sin contrastarlo contra la regla real y ya vigente de `spec.md` § "Regla no negociable de path de salida" / `idea.md` RN-07, que exige que viva dentro del árbol de specs (`.makia/docs/specs/apps/backend/domain-model.md`). El Orquestador, al lanzar SPEC, propagó el mismo error copiándolo literalmente en el prompt de delegación. SPEC creó el archivo en la ruta incorrecta; el USUARIO detectó el error de origen en `draft_base.md` y pidió corregirlo en cadena. SPEC corrigió su propia rama sin objeción una vez el Orquestador confirmó la anulación deliberada de la decisión cerrada de `draft.md`.

## Evidencia

- `52067b3`...`6ffa4a0` — `draft.md` original de IDEA, con la ruta imprecisa de `domain-model.md`.
- `79ed3e5` — `domain-model.md` creado en la ruta incorrecta por SPEC.
- `6302969` — corrección aplicada por SPEC en su rama tras confirmación del Orquestador.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto` (pendiente de Triage por el Orquestador en una sesión posterior).

## Cambio propuesto

Que IDEA valide explícitamente, al recibir el input crudo del usuario en `draft_base.md` o equivalente, cualquier ruta de documentación mencionada contra las reglas de `spec.md`/`idea.md` antes de darla por cerrada en `draft.md`. Decisión de Triage pendiente — no se aplica en este reporte.
