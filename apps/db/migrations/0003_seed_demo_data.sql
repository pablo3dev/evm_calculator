-- Datos DEMO: 4 proyectos que cubren todo el espectro de desempeño EVM
-- (excelente, bueno, regular, malo), cada uno con actividades que van
-- de excelente a malo y agregan hacia el resultado que declara el proyecto.
-- Incluye los 2 casos límite de RN-09 (domain-model.md): AC = 0 (CPI no
-- calculable) y PV = 0 vía planned_progress_percentage = 0 (SPI no calculable).
--
-- Los IDs los genera la base de datos (DEFAULT gen_random_uuid()); cada
-- proyecto y sus actividades se insertan en un único statement con CTE
-- para encadenar el id generado, sin quemar UUIDs literales.

-- =========================================================================
-- Proyecto 1 — EXCELENTE: Implementación de ERP
-- Agregado: CPI ≈ 1.16 (excelente), SPI ≈ 1.02 (bueno)
-- =========================================================================
WITH proj AS (
    INSERT INTO projects (name, description) VALUES (
        'Implementación de ERP',
        'DEMO — Proyecto con desempeño EXCELENTE: costo y cronograma por encima de lo planificado.'
    ) RETURNING id
)
INSERT INTO activities (project_id, name, budget_at_completion, planned_progress_percentage, actual_progress_percentage, actual_cost)
SELECT proj.id, v.name, v.bac, v.planned, v.actual, v.ac
FROM proj, (VALUES
    ('Excelente: Configuración de módulo financiero', 60000::numeric, 80::numeric, 88::numeric, 38000::numeric),
    ('Bueno: Migración de datos maestros',             40000, 70, 74, 27500),
    ('Regular: Pruebas de integración',                25000, 60, 57, 14000),
    ('Malo: Capacitación a usuarios finales',          15000, 50, 25,  7000)
) AS v(name, bac, planned, actual, ac);

-- =========================================================================
-- Proyecto 2 — BUENO: Migración a la Nube
-- Agregado: CPI ≈ 1.08 (bueno), SPI ≈ 1.02 (bueno)
-- Incluye caso límite: PV = 0 (planned_progress_percentage = 0) -> SPI no calculable.
-- =========================================================================
WITH proj AS (
    INSERT INTO projects (name, description) VALUES (
        'Migración a la Nube',
        'DEMO — Proyecto con desempeño BUENO: costo y cronograma levemente por encima de lo planificado.'
    ) RETURNING id
)
INSERT INTO activities (project_id, name, budget_at_completion, planned_progress_percentage, actual_progress_percentage, actual_cost)
SELECT proj.id, v.name, v.bac, v.planned, v.actual, v.ac
FROM proj, (VALUES
    ('Excelente: Diseño de arquitectura cloud',           45000::numeric, 75::numeric, 80::numeric, 30000::numeric),
    ('Bueno: Aprovisionamiento de infraestructura',        35000, 65, 66, 22000),
    ('Regular: Migración de aplicaciones',                 30000, 55, 50, 16000),
    ('Malo: Actividad aun no planificada (edge case SPI)', 10000,  0,  5,   800)
) AS v(name, bac, planned, actual, ac);

-- =========================================================================
-- Proyecto 3 — REGULAR: Rediseño de Sitio Web
-- Agregado: CPI ≈ 1.02 (al límite), SPI ≈ 0.94 (regular, atrasado en cronograma)
-- =========================================================================
WITH proj AS (
    INSERT INTO projects (name, description) VALUES (
        'Rediseño de Sitio Web',
        'DEMO — Proyecto con desempeño REGULAR: costo al límite y cronograma atrasado.'
    ) RETURNING id
)
INSERT INTO activities (project_id, name, budget_at_completion, planned_progress_percentage, actual_progress_percentage, actual_cost)
SELECT proj.id, v.name, v.bac, v.planned, v.actual, v.ac
FROM proj, (VALUES
    ('Excelente: Diseño UX/UI',          20000::numeric, 90::numeric, 95::numeric, 15000::numeric),
    ('Bueno: Desarrollo frontend',        30000, 70, 71, 22000),
    ('Regular: Integración con backend',  25000, 55, 48, 12500),
    ('Malo: Pruebas de aceptación',       15000, 40, 20,  4500)
) AS v(name, bac, planned, actual, ac);

-- =========================================================================
-- Proyecto 4 — MALO: Sistema de Inventario
-- Agregado: CPI ≈ 0.88 (malo), SPI ≈ 0.79 (malo)
-- Incluye caso límite: AC = 0 -> CPI (y en cascada EAC/VAC) no calculable.
-- =========================================================================
WITH proj AS (
    INSERT INTO projects (name, description) VALUES (
        'Sistema de Inventario',
        'DEMO — Proyecto con desempeño MALO: sobrecosto y atraso significativos.'
    ) RETURNING id
)
INSERT INTO activities (project_id, name, budget_at_completion, planned_progress_percentage, actual_progress_percentage, actual_cost)
SELECT proj.id, v.name, v.bac, v.planned, v.actual, v.ac
FROM proj, (VALUES
    ('Excelente: Levantamiento de requerimientos',              10000::numeric, 100::numeric, 100::numeric,  8000::numeric),
    ('Bueno: Diseño de base de datos',                           15000,  90,  88, 12500),
    ('Regular: Desarrollo del módulo de compras',                35000,  60,  45, 25000),
    ('Malo: Desarrollo del módulo de reportes (edge case CPI)',  20000,  30,   5,     0)
) AS v(name, bac, planned, actual, ac);
