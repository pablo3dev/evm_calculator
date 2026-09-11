# Documento de Lenguaje Ubicuo de EVM
## Dominio: Gestión del Valor Ganado (Earned Value Management - EVM) bajo el estándar PMI

Este documento define el **Lenguaje Ubicuo** formal del dominio para alinear a expertos de negocio, gerentes de proyecto y equipos de ingeniería en el marco del Diseño Guiado por el Dominio (Domain-Driven Design - DDD). Proporciona las definiciones, fórmulas, invariantes de negocio y conceptos requeridos para construir el Modelo de Dominio de un sistema de control y seguimiento de proyectos.

---

## 1. Contexto Organizacional y Estándar Base: PMI

### 1.1 Project Management Institute (PMI)
* **Definición del Término:** El Project Management Institute (PMI) es la principal asociación profesional a nivel global dedicada a la dirección de proyectos, programas y portafolios. Desarrolla estándares reconocidos internacionalmente, como la Guía del PMBOK® (*Project Management Body of Knowledge*) y el *Practice Standard for Earned Value Management*.
* **Rol en el Dominio:** Actúa como la fuente canónica de verdad para la terminología, metodologías de cálculo, estándares de descomposición de trabajo y métricas de desempeño de proyectos.
* **Conceptos Clave Derivados del PMI:**
  * **Línea Base del Alcance (Scope Baseline):** Incluye el Enunciado del Alcance del Proyecto, la Estructura de Desglose del Trabajo (EDT / WBS) y el Diccionario de la WBS.
  * **Línea Base del Cronograma (Schedule Baseline):** Cronograma aprobado con fechas planificadas de inicio y fin para cada paquete de trabajo o actividad.
  * **Línea Base de Costos (Cost Baseline):** Presupuesto distribuido en el tiempo (*S-curve*) sobre el cual se evalúa y mide el gasto real del proyecto.
  * **Línea Base para la Medición del Desempeño (Performance Measurement Baseline - PMB):** Plan integral e integrado que fusiona alcance, cronograma y costos para servir como punto de comparación en la técnica de EVM.

---

## 2. Gestión del Valor Ganado (Earned Value Management - EVM)

### 2.1 Definición Conceptual
* **Término:** Earned Value Management (EVM) / Gestión del Valor Ganado.
* **Definición:** Metodología sistemática de gestión de proyectos que integra mediciones de **alcance**, **tiempo (cronograma)** y **costo** en un modelo unificado. Permite cuantificar objetivamente el trabajo realmente ejecutado y compararlo de forma continua contra lo planificado y lo gastado, habilitando tanto diagnósticos de estado actual como pronósticos estadísticos de finalización.
* **Propósito en el Modelo de Dominio:** Servir como el motor analítico de evaluación cuantitativa del desempeño y salud del proyecto a una fecha de corte (*Data Date* o *Status Date*).

---

## 3. Glosario de Entidades y Conceptos del Dominio

| Término en Español | Término en Inglés / Sigla | Definición en el Dominio | Tipo de Concepto DDD |
| :--- | :--- | :--- | :--- |
| **Proyecto** | Project | Esfuerzo temporal para crear un producto o resultado único. Raíz del agregado principal. | Agregado / Entidad Raíz |
| **Fecha de Corte / Estado** | Status Date / Data Date | Punto temporal específico en el cual se evalúa el desempeño del proyecto y se calculan las métricas EVM. | Objeto de Valor (Value Object) |
| **Paquete de Trabajo** | Work Package | Nivel más bajo de descomposición de la EDT/WBS donde el costo y la duración se estiman y gestionan. | Entidad |
| **Cuenta de Control** | Control Account | Punto de gestión donde se integran alcance, presupuesto, costo real y cronograma para la medición de EVM. | Entidad |
| **Presupuesto a la Conclusión** | Budget at Completion (BAC) | Presupuesto total aprobado asignado al trabajo planificado del proyecto (excluyendo reservas de gestión). | Objeto de Valor (Moneda) |
| **Valor Planificado** | Planned Value (PV) / BCWS | Presupuesto autorizado asignado al trabajo programado para completarse hasta la fecha de corte. Históricamente *Budgeted Cost of Work Scheduled*. | Objeto de Valor (Moneda) |
| **Valor Ganado** | Earned Value (EV) / BCWP | Medida del trabajo realmente completado a la fecha de corte, expresada en términos del presupuesto autorizado para dicho trabajo. Históricamente *Budgeted Cost of Work Performed*. | Objeto de Valor (Moneda) |
| **Costo Real** | Actual Cost (AC) / ACWP | Costo total incurrido en la ejecución del trabajo realizado para una actividad durante un período determinado. Históricamente *Actual Cost of Work Performed*. | Objeto de Valor (Moneda) |

---

## 4. Métricas de Variación y Desviación (Reglas de Negocio)

Las variaciones determinan la desviación absoluta respecto a las líneas base aprobadas.

### 4.1 Variación del Costo (Cost Variance - CV)
* **Definición:** Diferencia cuantitativa entre el valor del trabajo completado y el costo financiero incurrido para realizarlo.
* **Fórmula:** 
  $$\text{CV} = \text{EV} - \text{AC}$$
* **Invariantes e Interpretación de Negocio:**
  * $\text{CV} > 0$: Favorable. Trabajo ejecutado a un costo menor al presupuestado (Bajo presupuesto).
  * $\text{CV} = 0$: Neutro. Costos reales alineados exactamente con el presupuesto previsto.
  * $\text{CV} < 0$: Desfavorable. Sobrecosto o sobregasto con respecto a lo presupuestado.

### 4.2 Variación del Cronograma (Schedule Variance - SV)
* **Definición:** Diferencia cuantitativa entre el trabajo ejecutado y el trabajo programado a la fecha de corte, medido en unidades monetarias del presupuesto.
* **Fórmula:** 
  $$\text{SV} = \text{EV} - \text{PV}$$
* **Invariantes e Interpretación de Negocio:**
  * $\text{SV} > 0$: Favorable. Se ha completado más trabajo del originalmente programado (Adelantado).
  * $\text{SV} = 0$: Neutro. Avance del trabajo exactamente alineado con el cronograma.
  * $\text{SV} < 0$: Desfavorable. Se ha completado menos trabajo del programado (Retrasado).
* *Nota de Dominio:* Al finalizar el proyecto ($100\%$ de avance), $\text{EV} = \text{BAC}$ y $\text{PV} = \text{BAC}$, por lo que $\text{SV} = 0$ independientemente de si el proyecto finalizó tarde.

---

## 5. Índices de Desempeño y Eficiencia (Reglas de Negocio)

Los índices miden la tasa de eficiencia relativa de costos y tiempo.

### 5.1 Índice de Desempeño del Costo (Cost Performance Index - CPI)
* **Definición:** Relación entre el valor del trabajo realizado y los costos reales incurridos. Representa el valor monetario obtenido por cada unidad monetaria gastada.
* **Fórmula:** 
  $$\text{CPI} = \frac{\text{EV}}{\text{AC}}$$
* **Invariantes e Interpretación de Negocio:**
  * $\text{CPI} > 1.0$: Alta eficiencia. Se obtiene más de $1.00 de valor por cada unidad monetaria invertida.
  * $\text{CPI} = 1.0$: Eficiencia nominal esperada según presupuesto.
  * $\text{CPI} < 1.0$: Baja eficiencia o déficit de gasto.

### 5.2 Índice de Desempeño del Cronograma (Schedule Performance Index - SPI)
* **Definición:** Relación entre el trabajo completado y el trabajo programado hasta la fecha de corte. Representa la tasa de avance respecto al plan inicial.
* **Fórmula:** 
  $$\text{SPI} = \frac{\text{EV}}{\text{PV}}$$
* **Invariantes e Interpretación de Negocio:**
  * $\text{SPI} > 1.0$: Ritmo de ejecución más rápido que el planificado.
  * $\text{SPI} = 1.0$: Ritmo de ejecución exactamente igual al planificado.
  * $\text{SPI} < 1.0$: Ritmo de ejecución inferior al planificado.

---

## 6. Métricas de Pronóstico y Proyección (Forecasting)

Permiten predecir el comportamiento financiero y operativo futuro en función del desempeño histórico.

### 6.1 Estimación a la Conclusión (Estimate at Completion - EAC)
* **Definición:** Costo total proyectado y anticipado del proyecto al momento de su finalización completa.
* **Modelos de Cálculo (Estrategias de Dominio):**
  1. **Tasa Típica (Variaciones futuras reflejarán el CPI actual):**
     $$\text{EAC} = \frac{\text{BAC}}{\text{CPI}}$$
  2. **Tasa Atípica (El trabajo restante se ejecutará según la tasa presupuestada inicial):**
     $$\text{EAC} = \text{AC} + (\text{BAC} - \text{EV})$$
  3. **Combinado Costo y Cronograma (Ambos factores influyen en el trabajo restante):**
     $$\text{EAC} = \text{AC} + \frac{\text{BAC} - \text{EV}}{\text{CPI} \times \text{SPI}}$$

### 6.2 Estimación hasta la Conclusión (Estimate to Complete - ETC)
* **Definición:** Costo monetario esperado para completar todo el trabajo restante pendiente del proyecto a partir de la fecha de corte.
* **Fórmula General:**
  $$\text{ETC} = \text{EAC} - \text{AC}$$

### 6.3 Variación a la Conclusión (Variance at Completion - VAC)
* **Definición:** Proyección de la diferencia entre el presupuesto original total y el costo final estimado del proyecto.
* **Fórmula:**
  $$\text{VAC} = \text{BAC} - \text{EAC}$$
* **Interpretación:**
  * $\text{VAC} > 0$: Se anticipa un ahorro (superávit presupuestario).
  * $\text{VAC} < 0$: Se anticipa un sobrecosto final (déficit presupuestario).

### 6.4 Índice de Desempeño del Trabajo por Completar (To-Complete Performance Index - TCPI)
* **Definición:** Nivel de eficiencia de costos que debe alcanzarse con los recursos restantes para cumplir con una meta presupuestaria específica (el BAC original o un nuevo EAC revisado).
* **Fórmulas:**
  * Para cumplir el presupuesto original (BAC):
    $$\text{TCPI}_{\text{BAC}} = \frac{\text{BAC} - \text{EV}}{\text{BAC} - \text{AC}}$$
  * Para cumplir la proyección revisada (EAC):
    $$\text{TCPI}_{\text{EAC}} = \frac{\text{BAC} - \text{EV}}{\text{EAC} - \text{AC}}$$
* **Interpretación:**
  * $\text{TCPI} > 1.0$: El trabajo restante debe ejecutarse con una eficiencia mayor que la originalmente presupuestada (difícil consecución si $\text{TCPI} > 1.10$).
  * $\text{TCPI} < 1.0$: Mayor holgura financiera para el remanente del proyecto.

---

## 7. Mapeo Conceptual hacia el Modelo de Dominio (Domain-Driven Design)

Para estructurar la arquitectura del software basada en este lenguaje ubicuo:

### 7.1 Agregados y Raíces de Agregado (Aggregate Roots)
* `Project`: Administra la vigencia del proyecto, sus líneas base y sus cuentas de control.
* `ControlAccount`: Agrupa paquetes de trabajo y actúa como el contenedor donde se calculan y persisten las instantáneas de desempeño.
* `PerformanceSnapshot` (Instantánea de Medición): Registra las métricas EVM en una `StatusDate` específica para permitir análisis de tendencias históricas.

### 7.2 Objetos de Valor (Value Objects)
* `MonetaryAmount`: Encapsula cantidad decimal y moneda (evitando errores de coma flotante y manejo de divisas).
* `PerformanceIndex`: Modela ratios como CPI, SPI y TCPI con validaciones de rangos y división por cero segura.
* `DateRange`: Intervalos temporales de inicio y fin para actividades y paquetes de trabajo.
* `ProgressPercentage`: Representación del porcentaje de avance físico ($0.0$ a $100.0\%$).

### 7.3 Eventos de Dominio (Domain Events)
* `PerformanceBaselineApproved`: Emitido cuando el BAC y el cronograma quedan formalmente congelados como línea base.
* `ActualCostLogged`: Registra un costo incurrido asignado a un paquete de trabajo o cuenta de control.
* `ProgressReported`: Notifica la actualización del avance físico y el cálculo de EV correspondiente.
* `CostVarianceThresholdExceeded`: Se dispara cuando $\text{CPI}$ o $\text{CV}$ cruzan umbrales críticos de tolerancia de negocio.
* `ScheduleVarianceThresholdExceeded`: Se dispara cuando $\text{SPI}$ o $\text{SV}$ alertan sobre retrasos críticos.

---

## 8. Tabla Resumen de Fórmulas y Reglas de Negocio

| Acrónimo | Concepto | Fórmula | Condición Favorable |
| :--- | :--- | :--- | :--- |
| **PV** | Planned Value | Presupuesto asignado al trabajo programado | N/A |
| **EV** | Earned Value | $\text{BAC} \times \% \text{ Avance Real}$ | N/A |
| **AC** | Actual Cost | Costo real devengado/incurrido | N/A |
| **CV** | Cost Variance | $\text{EV} - \text{AC}$ | $> 0$ (Bajo presupuesto) |
| **SV** | Schedule Variance | $\text{EV} - \text{PV}$ | $> 0$ (Adelantado en tiempo) |
| **CPI** | Cost Performance Index | $\frac{\text{EV}}{\text{AC}}$ | $> 1.0$ (Eficiente en costos) |
| **SPI** | Schedule Performance Index | $\frac{\text{EV}}{\text{PV}}$ | $> 1.0$ (Eficiente en cronograma) |
| **EAC** | Estimate at Completion | $\frac{\text{BAC}}{\text{CPI}}$ (Típico) | $< \text{BAC}$ |
| **ETC** | Estimate to Complete | $\text{EAC} - \text{AC}$ | N/A |
| **VAC** | Variance at Completion | $\text{BAC} - \text{EAC}$ | $> 0$ (Ahorro proyectado) |
| **TCPI** | To-Complete Performance Index | $\frac{\text{BAC} - \text{EV}}{\text{BAC} - \text{AC}}$ | $\le 1.0$ (Factible) |