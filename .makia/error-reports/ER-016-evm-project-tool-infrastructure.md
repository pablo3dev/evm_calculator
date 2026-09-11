# ER-016 — evm-project-tool-infrastructure

- **Spec/idea afectado:** evm-project-tool-infrastructure (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-07 — "CODE escala a IMPLEMENT un gap de `learning.md` (necesita algo que `learning.md` no cubre)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-05 (Dato faltante en `learning.md` — documenta yoyo 9.0.0 con cadena `postgresql+psycopg://` pero no aclara que yoyo 9.0, al recibir URLs con esquema `postgresql://` (sin `+psycopg`), requiere el driver `psycopg2-binary` como dependencia adicional en el contenedor migrate).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 2.x/4.1 (servicio `migrate` y arranque E2E), el contenedor one-shot de migraciones falló al ejecutar `yoyo apply --batch`: yoyo 9.0.0 no pudo resolver el driver para la URL `DATABASE_URL` con esquema `postgresql://` (formato estándar usado en `.env.example`). IMPLEMENT añadió `psycopg2-binary` al `Dockerfile` del servicio migrate junto a `psycopg[binary]`. El requisito de driver dual no estaba documentado en `learning.md` § yoyo-migrations. El evento se reportó al Orquestador de forma asíncrona.

## Evidencia

- `1fdf461` — commit de cierre E2E infrastructure (13/13 tareas).
- `apps/infrastructure/migrate/Dockerfile` línea 2 — `pip install ... yoyo-migrations==9.0.0 psycopg[binary] psycopg2-binary`.
- `.makia/idea/evm-project-tool/learning.md` § yoyo-migrations — solo menciona `postgresql+psycopg://user:pass@host/db`.
- `apps/infrastructure/.env.example` — `DATABASE_URL` con formato `postgresql+psycopg://…`.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: documentar en `learning.md` § yoyo-migrations los requisitos de driver según esquema de URL (`postgresql+psycopg://` vs. `postgresql://`) y la dependencia `psycopg2-binary` para yoyo 9.0. Decisión de Triage pendiente — no se aplica en este reporte.
