# ER-<NNN> — <spec-slug>

- **Spec/idea afectado:** <spec-slug o idea-slug, o `sin-spec`>
- **Versión de MakIA:** <contenido literal de `.makia/core/VERSION` en el momento de abrir el reporte; `desconocida` si el archivo falta o está corrupto>
- **Disparador:** <código de la tabla cerrada en `sub-orchestrator.md` § "Disparadores de error-report", p. ej. `D-14`, y su descripción literal>
- **Etapa:** <etapa del ciclo donde ocurrió el evento de fricción: IDEA / SPEC / IMPLEMENT (CODE<->TEST) / AUDIT / DEPLOY / Orquestación>
- **Causa raíz:** <código(s) de la taxonomía cerrada en `sub-orchestrator.md` § "Taxonomía cerrada de causa raíz", p. ej. `CR-06`, con su descripción literal; puede haber una causa raíz primaria y secundarias>
- **Fecha:** <YYYY-MM-DD>

## Descripción del evento de fricción

<Narrativa del evento: qué se esperaba, qué ocurrió, qué agente lo detectó y cómo se propagó por la cadena de delegación.>

## Evidencia

<Referencias verificables: hashes de commit, rutas de archivo, salidas de sub-agentes u otro rastro objetivo del evento.>

## Estado

`Abierto` -> `Triage` -> uno de { `Resuelto` | `Aceptado-como-deuda` | `Escalado-a-IDEA` | `Escalado-a-SPEC` }

Estado actual: <estado>

## Cambio propuesto

<Cambio concreto propuesto a plantillas/prompts de IDEA, SPEC u otro artefacto de MakIA para evitar que la fricción se repita. Queda pendiente de decisión del Orquestador en Triage — el reporte solo la propone, no la aplica.>
