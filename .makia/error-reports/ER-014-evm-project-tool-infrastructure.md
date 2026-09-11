# ER-014 — evm-project-tool-infrastructure

- **Spec/idea afectado:** evm-project-tool-infrastructure (idea: evm-project-tool)
- **Versión de MakIA:** v3.11.6
- **Disparador:** D-07 — "CODE escala a IMPLEMENT un gap de `learning.md` (necesita algo que `learning.md` no cubre)"
- **Etapa:** IMPLEMENT (CODE<->TEST)
- **Causa raíz:** CR-05 (Dato faltante en `learning.md` — no documenta que la imagen oficial `postgres:18` cambió la ruta de montaje de volumen de datos de `/var/lib/postgresql/data` a `/var/lib/postgresql`; el contenedor rechaza el mount en la ruta legacy). Secundaria: CR-04 (`design.md` §4.1.1 y esqueleto §4.4 aún prescriben `postgres_data:/var/lib/postgresql/data`).
- **Fecha:** 2026-09-11

## Descripción del evento de fricción

Durante la Tarea 4.1 (primer arranque E2E con `docker compose up --build`), el servicio `db` falló al iniciar: PostgreSQL 18 rechazó el volumen montado en `/var/lib/postgresql/data` con error de directorio de datos incompatible. CODE/IMPLEMENT identificaron que la imagen `postgres:18` exige montar en `/var/lib/postgresql` (nueva convención de la imagen oficial). Se corrigió `compose.yaml` cambiando el target del volumen. El gap no estaba cubierto en `learning.md` ni alineado con el esqueleto de `design.md`. El evento se reportó al Orquestador de forma asíncrona.

## Evidencia

- `1fdf461` — commit de cierre E2E infrastructure (13/13 tareas).
- `apps/infrastructure/compose.yaml` línea 9 — volumen corregido: `postgres_data:/var/lib/postgresql`.
- `.makia/docs/specs/apps/infrastructure/evm-project-tool-infrastructure/design.md` §4.1.1 y §4.4 — aún referencian `postgres_data:/var/lib/postgresql/data`.

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: `Abierto`

## Cambio propuesto

TBD — pendiente de Triage. Hipótesis inicial: documentar en `learning.md` § PostgreSQL la ruta de volumen correcta para `postgres:18` (`/var/lib/postgresql`) y alinear el esqueleto de `design.md` §4.1.1/§4.4. Decisión de Triage pendiente — no se aplica en este reporte.
