# MakIA (Claude Code)

Este proyecto usa MakIA para orquestar el desarrollo agéntico.

Toda petición, sin excepción, pasa primero por el Orquestador de MakIA,
definido en `.makia/core/agents/orchestrator/orchestrator.md`. Antes de actuar sobre cualquier tarea de
este proyecto, lee ese archivo primero: ahí se define el flujo de trabajo,
qué skills existen (expuestas también como comandos en `.claude/commands/`)
y cómo delegarlas.

La documentación del proyecto (specs, decisiones, guías) vive en
`.makia/docs/` — ver `README.md`.
