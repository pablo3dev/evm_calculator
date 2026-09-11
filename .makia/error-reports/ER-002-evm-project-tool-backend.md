# ER-002 — evm-project-tool-backend

- **Spec/idea afectado:** evm-project-tool-backend (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-09 — "Discrepancia con la tabla de archivos de `design.md`: CODE necesita crear/modificar un archivo no listado, o un archivo listado resulta innecesario o incorrecto"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-03 (Tabla de archivos de `design.md` incorrecta o incompleta — el segmento de paquete `application/ports/in/` usa la palabra reservada `in` de Python, lo que impide imports estándar y obliga a un workaround no previsto en el diseño).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 2.1 (puertos de entrada), CODE implementó los Protocols en `application/ports/in/` según `design.md` §4.1 y la tabla de archivos de `tasks.md`. Al intentar importar el subpaquete `in` con la sintaxis estándar de Python (`from evm_project_tool.application.ports.in import ...`), el compilador interpreta `in` como keyword y falla. CODE detectó la discrepancia entre la estructura prescrita y la viabilidad de imports en Python, y aplicó un workaround con `importlib.import_module(".in", __package__)` en `application/ports/__init__.py` y re-exports relativos en `ports/in/__init__.py`. IMPLEMENT reportó el evento al Orquestador de forma asíncrona; la corrección no bloqueó el avance de la tarea.

## Evidencia

- `24d4232` — commit de Tarea 2.1 (puertos de entrada).
- `apps/backend/src/evm_project_tool/application/ports/__init__.py` — workaround `importlib.import_module(".in", __package__)`.
- `.makia/docs/specs/apps/backend/evm-project-tool-backend/design.md` §4.1 — ruta `application/ports/in/` prescrita.
- `.makia/docs/specs/apps/backend/evm-project-tool-backend/summary.md` — nota técnica documentando el workaround post-implementación.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: que SPEC valide en `design.md` que los segmentos de ruta de paquetes Python no colisionen con keywords del lenguaje (p. ej. renombrar `ports/in/` a `ports/inbound/` o `ports/repositories/`). Decisión de Triage pendiente — no se aplica en este reporte.
