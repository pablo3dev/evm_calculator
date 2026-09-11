# error-reports

Esta carpeta es el bucle de mejora continua de MakIA: cada evento de fricción del ciclo de desarrollo (una decisión que IDEA/SPEC no cerraron con precisión, una corrección del USUARIO sobre algo dado por cerrado, un fallo de aislamiento del host, etc.) se captura aquí como un `ER-<NNN>-<spec-slug>.md` a partir de `_TEMPLATE.md`, con su disparador y causa raíz tomados de las tablas cerradas de `sub-orchestrator.md`, y se indexa en `INDEX.md`. Cada reporte recorre el ciclo de vida `Abierto` -> `Triage` -> `Resuelto` / `Aceptado-como-deuda` / `Escalado-a-IDEA` / `Escalado-a-SPEC`, siempre en paralelo al desarrollo (nunca lo bloquea) y siempre redactado por EDITOR, nunca por el Orquestador con sus propias manos.

Para el proceso completo (autoría, versionado, numeración, ciclo de vida y aprobación del USUARIO) la fuente de verdad es `.makia/core/agents/orchestrator/orchestrator.md` § "Mejora continua / reporte de error".
