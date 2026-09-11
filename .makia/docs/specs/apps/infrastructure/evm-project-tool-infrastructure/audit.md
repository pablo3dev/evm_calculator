# Audit Report: evm-project-tool-infrastructure

## 1. Metadata
- **Spec Auditado:** `evm-project-tool-infrastructure`
- **Ruta:** `.makia/docs/specs/apps/infrastructure/evm-project-tool-infrastructure`
- **Fecha de Auditoría:** `2026-09-11`
- **Auditor:** `AUDIT`
- **Ciclo de Auditoría:** `1`

---

## 2. Alcance de la Verificación
- [x] El código implementado cumple con `requirements.md` (criterios EARS) y `design.md` (contratos, estructura de archivos).
- [x] El spec (`requirements.md`/`design.md`) está alineado con `domain-model.md` (lenguaje ubicuo, límites del Contexto Delimitado, entidades y reglas de negocio) — esta unidad no implementa dominio EVM; solo orquesta servicios hermanos.

---

## 3. Hallazgos y Desviaciones
| ID | Descripción | Severidad | Referencia (REQ/DESIGN/domain-model) |
|:---|:---|:---:|:---|
| **H-01** | El volumen de PostgreSQL monta `postgres_data:/var/lib/postgresql` en lugar de `/var/lib/postgresql/data` documentado en `design.md` §4.4. E2E y persistencia en segundo arranque verificados por TEST; no bloquea operación local. | `Menor` | `DESIGN §4.4 / REQ-5.3` |
| **H-02** | `.env.example` usa `DATABASE_URL=postgresql://…` mientras `design.md` §4.2 ejemplifica `postgresql+psycopg://…`. El comentario en `.env.example` justifica compatibilidad con backend (psycopg directo) y yoyo 9.0; TEST E2E confirma migrate y backend operativos. | `Menor` | `DESIGN §4.2 / REQ-6.4` |
| **H-03** | `README.md` no documenta el escenario de fallo de `migrate` ni la recuperación segura (backend no arranca; revisar logs de migrate), requerido por REQ-10.4. | `Menor` | `REQ-10.4` |
| **H-04** | `compose.yaml` redefine el `command` del servicio `backend` con instalación runtime de `uvicorn[standard]`, desviando del `CMD` del Dockerfile hermano (`fastapi run …`). Es cableado de orquestación dentro de `apps/infrastructure/` (no modifica fuente de `apps/backend/`); TEST E2E pasó. | `Menor` | `DESIGN §4.1.3 / RN-INF-07` |

---

## 4. Supuestos Detectados
- IMPLEMENT asumió que `postgresql://` es el formato canónico compartido por yoyo 9.0 y el backend FastAPI (psycopg ConnectionPool), en lugar del dialecto SQLAlchemy `postgresql+psycopg://` del esqueleto de diseño — documentado en comentario de `.env.example`.
- IMPLEMENT asumió que el entrypoint `fastapi run` del Dockerfile de backend no es adecuado en el contexto Compose y sustituyó el arranque por `uvicorn` instalado en runtime vía `command` del compose — no respaldado explícitamente en `design.md`.

---

## 5. Preguntas Abiertas
Sin preguntas abiertas.

---

## 6. Recomendaciones
- Alinear el punto de montaje del volumen PostgreSQL con `design.md` (`/var/lib/postgresql/data`) o actualizar el design si `postgres:18` exige `/var/lib/postgresql` como convención oficial.
- Unificar el formato de `DATABASE_URL` entre `design.md` §4.2 y `.env.example`, o documentar en `design.md` la excepción `postgresql://` como contrato cerrado del monorepo.
- Ampliar `README.md` con una subsección de troubleshooting: fallo de `migrate` → backend bloqueado por `service_completed_successfully`; consultar `docker compose logs migrate` y re-ejecutar `docker compose up`.
- Evaluar eliminar la instalación runtime de uvicorn en `compose.yaml` cuando el Dockerfile de backend exponga un entrypoint estable para Compose (p. ej. alinear `CMD` del Dockerfile con el comando usado en compose).
- Eliminar `psycopg2-binary` del `migrate/Dockerfile` si no es requerido por yoyo 9.0 (solo `psycopg[binary]` está en el esqueleto §4.5).

---

## 7. Veredicto Final

**Veredicto:** `PASA_CON_OBSERVACIONES`

La implementación en `apps/infrastructure/` cumple el contrato de orquestación: cuatro servicios (`db`, `migrate`, `backend`, `frontend`), orden `db (healthy) → migrate (completed) → backend → frontend`, secretos vía `.env` gitignored, puertos host `8000`/`8080`, `VITE_API_BASE_URL` orientada al navegador, sin lógica de negocio EVM ni modificación de código hermano. TEST reportó PASS en footprint §5, E2E primer y segundo arranque, `/api-docs` 200 y frontend 8080 200. Las desviaciones detectadas son menores y no bloquean la operación local ni los criterios EARS de orquestación.
