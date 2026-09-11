# Audit Report: evm-project-tool-infrastructure

## 1. Metadata
- **Spec Auditado:** `evm-project-tool-infrastructure`
- **Ruta:** `.makia/docs/specs/apps/infrastructure/evm-project-tool-infrastructure`
- **Fecha de Auditoría:** `2026-09-11`
- **Auditor:** `AUDIT`
- **Ciclo de Auditoría:** `2`

---

## 2. Alcance de la Verificación
- [x] El código implementado cumple con `requirements.md` (criterios EARS) y `design.md` (contratos, estructura de archivos).
- [x] El spec (`requirements.md`/`design.md`) está alineado con `domain-model.md` (lenguaje ubicuo, límites del Contexto Delimitado, entidades y reglas de negocio) — esta unidad no implementa dominio EVM; solo orquesta servicios hermanos.

**Fuentes contrastadas:**
- `requirements.md` — REQ-01..REQ-10, RN-INF-01..RN-INF-07, EC-INF-01..EC-INF-07
- `design.md` — §4.1..§4.5 (servicios, variables, esqueletos compose/migrate), §5 footprint
- Código: `apps/infrastructure/` (`compose.yaml`, `.env.example`, `.gitignore`, `migrate/Dockerfile`, `README.md`)
- Backend hermano (H-04): `apps/backend/Dockerfile`, `apps/backend/pyproject.toml` (commits `1e91193`)
- Evidencia TEST post-fix (informada por Orquestador): `/api-docs` 200, frontend `:8080` 200, backend CMD de imagen verificado

**Verificaciones de orquestación (muestreo representativo):**

| Requisito / contrato | Evidencia en código | Resultado |
|:---|:---|:---:|
| REQ-01 / RN-INF-03 | `compose.yaml`: `db` healthy → `migrate` completed → `backend` → `frontend` | OK |
| REQ-03 / RN-INF-02 | `.env.example` (7 variables), `.gitignore` ignora `.env`, sin secretos en compose | OK |
| REQ-04 / RN-INF-04 | `DATABASE_URL` host `db`, `CORS_ORIGINS=http://localhost:8080`, `VITE_API_BASE_URL` build-arg, puertos `8000:8000` / `8080:80` | OK |
| REQ-05 / DESIGN §4.1.1 | `postgres:18`, volumen `postgres_data:/var/lib/postgresql`, healthcheck `pg_isready` | OK |
| REQ-06 / DESIGN §4.1.2 | `migrate/Dockerfile` Python 3.14 + yoyo 9.0.0; volumen `../db/migrations:ro`; restart `"no"` | OK |
| REQ-10.4 | `README.md` §Troubleshooting: fallo migrate → backend bloqueado; logs + `docker compose up` | OK |
| DESIGN §4.1.3 / RN-INF-07 | `backend` sin `command:` override; `CMD` Dockerfile hermano `uvicorn …:8000` | OK |
| DESIGN §5 footprint | Solo `apps/infrastructure/`; sin lefthook ni código hermano duplicado | OK |

---

## 3. Hallazgos y Desviaciones

### Ciclo 1 — resolución de observaciones menores

| ID | Estado | Evidencia de corrección |
|:---|:---:|:---|
| **H-01** | **Resuelto** | `design.md` §4.1.1 y §4.4 documentan `postgres_data:/var/lib/postgresql` como contrato cerrado para `postgres:18`; `compose.yaml` L9 coincide. Commit `63bec2f`. |
| **H-02** | **Resuelto** | `design.md` §4.1.2 y §4.2 unifican `DATABASE_URL=postgresql://…` (libpq/psycopg, no dialecto SQLAlchemy); `.env.example` L6-9 alineado con comentario explicativo. Commit `63bec2f`. |
| **H-03** | **Resuelto** | `README.md` L52-70: subsección «`migrate` failed — backend does not start» con logs, causa y reinicio seguro; cumple REQ-10.4. Commit `e1bc1fe`. |
| **H-04** | **Resuelto** | `compose.yaml` servicio `backend` sin `command:` override; `apps/backend/Dockerfile` L29 `CMD ["uvicorn", …]`; `pyproject.toml` incluye `uvicorn[standard]>=0.34`. Commits `1e91193`, `46c0b3d`. |

### Ciclo 2 — nuevos hallazgos

| ID | Descripción | Severidad | Referencia (REQ/DESIGN/domain-model) |
|:---|:---|:---:|:---|
| — | Sin hallazgos bloqueantes ni menores nuevos | — | — |

---

## 4. Supuestos Detectados
Sin supuestos detectados en ciclo 2. Las correcciones de IMPLEMENT iteración 1 están respaldadas por `design.md` actualizado y código verificado.

---

## 5. Preguntas Abiertas
Sin preguntas abiertas.

---

## 6. Recomendaciones
> Mejoras sugeridas que **no** son bloqueantes — no afectan negocio ni funcionalidad, quedan a criterio de una futura iteración.

- **R-01:** Eliminar `psycopg2-binary` del `migrate/Dockerfile` si yoyo 9.0 opera solo con `psycopg[binary]` (esqueleto §4.5 no lo incluye; la dependencia extra permanece en L2 del Dockerfile actual).

---

## 7. Veredicto Final

**Veredicto:** `PASA`

Las observaciones menores del ciclo 1 (**H-01** mount PostgreSQL, **H-02** formato `DATABASE_URL`, **H-03** troubleshooting migrate, **H-04** CMD backend estable sin override en compose) quedaron corregidas y verificadas en spec y código. La orquestación en `apps/infrastructure/` cumple REQ-01..REQ-10, RN-INF-01..RN-INF-07, contratos §4 de `design.md` y footprint §5. TEST post-fix confirmó E2E operativo (`/api-docs` 200, frontend 8080 200, CMD de imagen backend). Queda únicamente la recomendación opcional R-01 (dependencia redundante en migrate).

**Datos para error-report (D-02):**
| Hallazgo ciclo 1 | Estado | Commits de corrección |
|:---|:---|:---|
| H-01 | Cerrado | `63bec2f` |
| H-02 | Cerrado | `63bec2f` |
| H-03 | Cerrado | `e1bc1fe` |
| H-04 | Cerrado | `1e91193`, `46c0b3d` |
