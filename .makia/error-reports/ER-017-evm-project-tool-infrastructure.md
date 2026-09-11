# ER-017 — evm-project-tool-infrastructure

- **Spec/idea afectado:** evm-project-tool-infrastructure (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-01 — "Primer fallo de TEST para una tarea en el ciclo interno de IMPLEMENT (CODE<->TEST)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-08 (Error propio de CODE — durante la verificación E2E de la Tarea 4.1 se atribuyó erróneamente un fallo de conectividad al puerto 8000 a un proceso Python del host que ocupaba el puerto; la verificación posterior con `curl` demostró que el backend en el contenedor respondía correctamente en `localhost:8000`, descartando el conflicto de puerto como causa).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 4.1 (primer arranque E2E), CODE/IMPLEMENT detectaron un proceso Python en el host escuchando en el puerto 8000 y lo consideraron la causa de un fallo de verificación inicial. Tras investigar el bind del puerto, la verificación con `curl http://localhost:8000/api-docs` confirmó que el backend del stack Compose respondía con HTTP 200 — el diagnóstico de conflicto de puerto resultó ser un falso positivo. El tiempo invertido en la pista incorrecta retrasó la identificación de la causa real (otros gaps documentados en ER-014..016). El evento se reportó al Orquestador de forma asíncrona.

## Evidencia

- `1fdf461` — commit de cierre E2E infrastructure (13/13 tareas); verificación final exitosa.
- `.makia/docs/specs/apps/infrastructure/evm-project-tool-infrastructure/design.md` §8 / EC-INF-11 — riesgo documentado de puerto 8000 ocupado en host.
- `apps/infrastructure/compose.yaml` líneas 40-41 — publicación `8000:8000` del servicio backend.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: que el checklist E2E de infrastructure distinga proceso host vs. contenedor al diagnosticar conflictos de puerto (p. ej. verificar con `curl` al endpoint publicado antes de asumir bind failure). Decisión de Triage pendiente — no se aplica en este reporte.
