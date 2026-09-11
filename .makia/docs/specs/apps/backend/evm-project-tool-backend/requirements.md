# EVM Project Tool — Backend API

> **Artefacto de aprobación.** Este documento define alcance, objetivos, criterios de éxito, reglas de negocio y requerimientos funcionales del backend. Es autosuficiente para aprobación: no remite a `design.md` ni `tasks.md` para criterios de aprobación.

**Spec slug:** `evm-project-tool-backend`

---

## Resumen

API REST construida con FastAPI que concentra **toda la lógica de negocio EVM** (Earned Value Management) del producto. Es el dueño del dominio de cálculo de indicadores, validaciones y consolidación por proyecto. El modelo de dominio compartido se documenta en [`../../domain-model.md`](../../domain-model.md) como contexto conceptual; las reglas operativas y requerimientos de este artefacto son la fuente de verdad para aprobación del backend.

El backend persiste proyectos y actividades en PostgreSQL (esquema definido por la unit-spec hermana [`../../db/evm-project-tool-db/requirements.md`](../../db/evm-project-tool-db/requirements.md)) y expone endpoints REST para CRUD y consulta de indicadores calculados en tiempo de lectura.

---

## Problema

Los equipos de gestión de proyectos necesitan calcular indicadores EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC) de forma consistente, con reglas claras para casos límite (divisiones por cero, proyectos sin actividades, valores negativos) y consolidación correcta a nivel proyecto. Sin un backend dedicado, la lógica se fragmenta, se duplica entre capas o se calcula incorrectamente (por ejemplo, promediando CPI/SPI en lugar de agregar bases).

---

## Solución

Un servicio backend con arquitectura hexagonal (`domain` / `application` / `infra`) en `apps/backend/` que:

1. Expone API REST documentada (Swagger UI) para gestión de proyectos y actividades.
2. Calcula indicadores EVM por actividad y consolidados por proyecto aplicando las reglas RN-01..RN-13.
3. Valida entradas con Pydantic y devuelve códigos HTTP semánticos (422, 404, 200).
4. Accede a PostgreSQL mediante SQL parametrizado (`%s`) sin ORM, sobre el esquema de tablas `projects` y `activities` provisto por la unit-spec de base de datos.

Los indicadores **no se persisten**; se calculan en cada lectura a partir de BAC, porcentajes de avance y AC almacenados.

---

## Objetivos y criterios de éxito

| Objetivo | Criterio de éxito |
|----------|-------------------|
| Dominio EVM correcto | Todos los indicadores por actividad y consolidados cumplen RN-01..RN-13; casos EC-01..EC-09 verificados |
| API REST usable | CRUD completo de proyectos y actividades; respuestas con indicadores e interpretaciones textuales |
| Validación robusta | Entradas inválidas → HTTP 422; recursos inexistentes → HTTP 404; nunca HTTP 500 por reglas de negocio |
| Documentación operativa | Swagger UI accesible en `/api-docs` o `/swagger-ui` con esquemas y códigos de error |
| Calidad verificable | Cobertura ≥ 80 % en capa de negocio (`domain` + `application`); ≥ 1 test de integración por endpoint REST |
| Seguridad básica | SQL parametrizado, validación Pydantic, secretos por variables de entorno, CORS configurable sin wildcard |

---

## Actores de negocio y flujo de valor

| Actor | Rol | Flujo de valor |
|-------|-----|----------------|
| **Gestor de proyecto** | Crea proyectos, define actividades con BAC y avances | Registra datos base → consulta indicadores por actividad y consolidado del proyecto para tomar decisiones |
| **Analista EVM** | Interpreta CPI, SPI, EAC, VAC | Lee indicadores calculados e interpretaciones textuales sin recalcular manualmente |
| **Cliente frontend** | Consume la API REST | CRUD y lecturas de indicadores para presentación en UI (fuera de alcance de este spec) |
| **Operaciones / DevOps** | Despliega y observa el servicio | Logs estructurados en mutaciones, validaciones y advertencias de indicadores nulos |

**Flujo principal:** crear proyecto → crear actividades con BAC, % avance planificado, % avance real y AC → consultar indicadores por actividad → consultar indicadores consolidados del proyecto.

---

## Delimitación del Alcance

### In Scope

- API REST FastAPI con toda la lógica de negocio EVM
- CRUD de proyectos y actividades
- Cálculo en lectura de PV, EV, CV, SV, CPI, SPI, EAC, VAC por actividad y consolidado por proyecto
- Interpretación textual de CPI y SPI (incluido estado nulo según RN-09)
- Validaciones de negocio (porcentajes 0–100, BAC/AC ≥ 0, nombres no vacíos)
- Documentación OpenAPI / Swagger UI
- Arquitectura hexagonal en `apps/backend/`
- Dependencia de datos: esquema PostgreSQL (`projects`, `activities`) según unit-spec db hermana
- Stack: Python 3.14.7, FastAPI 0.141.1, Pydantic v2, uv 0.12.9, psycopg 3.2.10, ruff 0.16.3

### Out of Scope

- Persistencia histórica de indicadores EVM
- Autenticación y autorización
- TCPI, ETC y modelos alternativos de EAC
- Multi-moneda
- Notificaciones por umbrales de indicadores
- Dashboard visual (REQ-06 — responsabilidad frontend)
- Crear `lefthook.yml` desde cero (responsabilidad de la unit-spec db; el backend no duplica)
- Definición de esquema DB, migraciones y ownership del esquema (unit-spec db)

---

## Reglas de Negocio

### RN-01: Planned Value (PV)

PV = % avance planificado × BAC

### RN-02: Earned Value (EV)

EV = % avance real × BAC

### RN-03: Cost Variance (CV)

CV = EV − AC. CV > 0 favorable, CV = 0 neutro, CV < 0 desfavorable.

### RN-04: Schedule Variance (SV)

SV = EV − PV. SV > 0 adelantado, SV = 0 neutro, SV < 0 atrasado.

**Nota:** al 100 % de avance, EV = BAC y PV = BAC, por lo tanto SV = 0 aunque el proyecto haya terminado tarde.

### RN-05: Cost Performance Index (CPI)

CPI = EV / AC. CPI > 1 alta eficiencia, CPI = 1 nominal, CPI < 1 baja eficiencia.

### RN-06: Schedule Performance Index (SPI)

SPI = EV / PV. SPI > 1 más rápido, SPI = 1 igual, SPI < 1 inferior.

### RN-07: Estimate at Completion (EAC)

EAC = BAC / CPI (único modelo: tasa de costo típica).

### RN-08: Variance at Completion (VAC)

VAC = BAC − EAC. VAC > 0 ahorro, VAC < 0 sobrecosto.

### RN-09: Indicadores nulos por división inválida

- **AC = 0** → CPI = `null` con interpretación *"Sin costo real registrado — CPI no aplicable"*. EAC y VAC = `null` en cascada.
- **PV = 0** → SPI = `null` con interpretación *"Sin avance planificado a la fecha — SPI no aplicable"*.
- Nunca lanzar excepción ni devolver `Infinity`.

### RN-10: Rango de porcentajes

Porcentajes de avance planificado y real: 0–100 inclusive. Fuera de rango → HTTP 422.

### RN-11: Valores monetarios no negativos

BAC y AC ≥ 0. Valores negativos → HTTP 422.

### RN-12: Consolidación a nivel proyecto

Consolidar agregando bases: Σ BAC, Σ PV, Σ EV, Σ AC; luego aplicar fórmulas RN-01..RN-08 sobre totales. **Nunca** promediar CPI o SPI individuales.

### RN-13: Proyecto sin actividades

Proyecto sin actividades → totales en 0, CPI / SPI / EAC / VAC = `null` con interpretación correspondiente. HTTP 200 válido; nunca HTTP 500.

---

## Requerimientos Funcionales (EARS)

### REQ-01: Gestión de proyectos

**When** el cliente invoca operaciones CRUD REST sobre proyectos,  
**the system shall** crear, leer, actualizar y eliminar proyectos persistidos en PostgreSQL.

- **When** `name` está vacío en creación o actualización, **the system shall** responder HTTP 422.
- **When** se solicita eliminar un proyecto inexistente, **the system shall** responder HTTP 404.

### REQ-02: Gestión de actividades

**When** el cliente invoca operaciones CRUD REST sobre actividades filtradas por `project_id`,  
**the system shall** crear, leer, actualizar y eliminar actividades asociadas a un proyecto.

- **When** BAC o AC son negativos, **the system shall** responder HTTP 422 (RN-11).
- **When** porcentajes de avance están fuera de 0–100, **the system shall** responder HTTP 422 (RN-10).
- **When** `project_id` no existe, **the system shall** responder HTTP 404.
- **When** se solicita eliminar una actividad inexistente, **the system shall** responder HTTP 404.

### REQ-03: Indicadores EVM por actividad

**When** el cliente consulta una actividad (lectura individual o listado),  
**the system shall** incluir en la respuesta PV, EV, CV, SV, CPI, SPI, EAC y VAC calculados según RN-01..RN-08.

- **The system shall not** persistir indicadores; se calculan en cada lectura.
- **When** AC = 0 o PV = 0, **the system shall** aplicar RN-09 (valores nulos e interpretación, sin excepción).

### REQ-04: Interpretación textual CPI / SPI

**When** el cliente consulta indicadores de actividad o consolidado de proyecto,  
**the system shall** incluir texto interpretativo de CPI y SPI acorde a RN-05 y RN-06, o acorde a RN-09 cuando el indicador sea `null`.

### REQ-05: Indicadores consolidados por proyecto

**When** el cliente consulta indicadores consolidados de un proyecto,  
**the system shall** calcular totales agregando bases y aplicando RN-12.

- **When** el proyecto no tiene actividades, **the system shall** aplicar RN-13 (totales 0, indicadores derivados nulos, HTTP 200).

### REQ-07: Documentación de API

**The system shall** exponer documentación interactiva Swagger UI en `/api-docs` o `/swagger-ui`, incluyendo esquemas de request/response y códigos de error documentados.

---

## Edge Cases

| ID | Condición | Comportamiento esperado |
|----|-----------|-------------------------|
| EC-01 | AC = 0 | CPI, EAC y VAC = `null`; interpretación RN-09 para CPI |
| EC-02 | PV = 0 | SPI = `null`; interpretación RN-09 |
| EC-03 | Proyecto sin actividades | Totales 0; CPI, SPI, EAC, VAC = `null`; HTTP 200 (RN-13) |
| EC-04 | Avance real 0 %, AC > 0 | EV = 0; CPI = 0; demás indicadores calculables según fórmulas |
| EC-05 | BAC = 0 | PV = 0, EV = 0; SPI nulo si PV = 0; resto según bases |
| EC-06 | Escenario favorable normal | CV > 0, SV ≥ 0, CPI > 1, SPI ≥ 1 según datos de entrada |
| EC-07 | `project_id` inexistente | HTTP 404 |
| EC-08 | Porcentaje fuera de 0–100 | HTTP 422 (RN-10) |
| EC-09 | BAC o AC negativos | HTTP 422 (RN-11) |

---

## Restricciones Operativas

### Seguridad (nivel negocio)

- Consultas SQL parametrizadas con placeholder `%s`; prohibido concatenar entrada de usuario en SQL.
- Validación de entrada mediante Pydantic v2 en todos los endpoints.
- Secretos y credenciales exclusivamente por variables de entorno.
- CORS configurable; no permitir origen wildcard (`*`) en producción.
- Sin autenticación ni autorización en este alcance.

### Observabilidad

- **INFO** en mutaciones (create/update/delete) con `id` y/o `project_id`.
- **WARNING** cuando un indicador resulte `null` por RN-09.
- **INFO** en respuestas de validación HTTP 422 y HTTP 404.

### Tests

- Cobertura mínima **≥ 80 %** en capa de negocio (`domain` + `application`).
- Mínimo **≥ 1 test de integración por endpoint REST** (happy path y, cuando aplique, casos de error 404/422).

### Stack fijado

| Componente | Versión / criterio |
|------------|-------------------|
| Python | 3.14.7 |
| FastAPI | 0.141.1 |
| Pydantic | v2 (obligatorio) |
| uv | 0.12.9 |
| psycopg | 3.2.10 |
| SQL | Directo parametrizado `%s`, sin ORM |
| Linter | ruff 0.16.3 |
| Arquitectura | Hexagonal: `domain` / `application` / `infra` en `apps/backend/` |
| Base de datos | PostgreSQL; tablas `projects` y `activities` según unit-spec db hermana |
