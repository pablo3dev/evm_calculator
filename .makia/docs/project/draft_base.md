# Problema

Queremos construir una herramienta interna para que los líderes de proyecto puedan registrar el avance de sus actividades y entender, en tiempo real, si su proyecto va bien o mal en términos de cronograma y presupuesto. 

La metodología que usaremos para ese análisis es el Valor Ganado (Earned Value 
Management), un estándar del PMI que permite medir el desempeño de un proyecto en términos de costo y tiempo.

La idea central del Valor Ganado es sencilla: no basta con saber cuánto has gastado ni cuánto has avanzado por separado. Lo que importa es la relación entre los dos. Un proyecto puede haber gastado el 60% del presupuesto habiendo completado solo el 40% del trabajo — y eso es una señal de alerta. Los indicadores EVM permiten cuantificar exactamente eso.

---

# Qué se debe construir

Una aplicación fullstack (e2e), que permita gestionar proyectos y sus actividades, y que calcule automáticamente los indicadores de Valor Ganado.

## Base de datos

### Rutas
- .makia/docs/specs/apps/db/
- apps/db/

Stack
- PostgreSQL
- Docker

### Requerimientos
- id : UUID
- campos de fechas: timestamptz

## Backend
> Arquitectura por defecto de MakIA

### Rutas
- .makia/docs/specs/apps/backend/
- apps/backend/

### Stack
- Python 3.14
- FastAPI
- uv
- Prohibido ORMs
- PostgreSQL
- yoyo para migraciones
- Docker

### Reglas
- Debe contener toda la lógica de negocio y validaciones de la aplicación.
- Debe contener todas las reglas de negocio
- No debe delegar ni asumir la lógica de negocio al frontend. 

### Requerimientos

Necesitamos una API REST que exponga operaciones para crear, editar y eliminar proyectos y actividades. Cada actividad debe registrar los siguientes datos: 

- Nombre 
- Presupuesto total planificado (BAC — Budget at Completion) 
- Porcentaje de avance planificado a la fecha de corte 
- Porcentaje de avance real completado 
- Costo real incurrido hasta la fecha (AC — Actual Cost) 

Se debe realizar un diseño de bases de datos para estructurar esto en las tablas correspondientes con nombres en inglés en los campos de la tabla.

Con esos datos, el sistema debe calcular automáticamente los siguientes indicadores por actividad y de forma consolidada por proyecto: 

| Indicador | Fórmula |
| :--- | :--- |
| PV — Planned Value | % planificado × BAC |
| EV — Earned Value | % completado × BAC |
| CV — Cost Variance | EV − AC |
| SV — Schedule Variance | EV − PV |
| CPI — Cost Performance Index | EV / AC |
| SPI — Schedule Performance Index | EV / PV |
| EAC — Estimate at Completion | BAC / CPI |
| VAC — Variance at Completion | BAC − EAC |

El API también debe retornar la interpretación de CPI y SPI: si el proyecto está bajo presupuesto o sobre presupuesto, adelantado o atrasado. Un CPI mayor a 1 indica eficiencia en costos; menor a 1 indica que se está gastando más de lo que se avanza. El SPI funciona con la misma lógica pero sobre el cronograma.

## Frontend
> Arquitectura por defecto de MakIA y las reglas de frontend establecidas por MakIA.

### Rutas
- .makia/docs/specs/apps/frontend/
- apps/frontend/

### Stack
- React
- TypeScript
- Node.js
- Docker
- vite

### Reglas

- No debe tener reglas ni lógica de negocio. Toda la lógica de negocio debe estar en el backend.
- Solo capa precentación: Captura datos, envía datos, recibe datos y pinta datos. 
- No debe hacer cálculos ni validaciones de negocio.

### Requerimientos

Un dashboard donde el líder de proyecto pueda ingresar y editar sus actividades, y ver el resultado del análisis en tiempo real. Debe incluir la tabla de actividades con sus indicadores calculados, los indicadores consolidados del proyecto, una indicación visual del estado de CPI y SPI, y una gráfica que compare PV, EV y AC por actividad. 

No pedimos un diseño elaborado. Pedimos que la información sea clara y que quien la mire entienda de un vistazo si el proyecto va bien o mal. 

El deseño debe ser muy visual, con colores y gráficos que permitan entender rápidamente el estado del proyecto, intuitivo y atractivo. No deben existir elementos que no tengan proposito, funcionalidad o que no aporten valor.


## Infrastructure 

Este proyecto centraliza todo el run local en docker y contiene todos los archivos de docker-compose y los comandos para ejecutar la compilación de todas las apps.

El objetivo de este proyecto es correr el docker-compose y levantar todas las apps en un solo comando, sin necesidad de correr cada app por separado o correr scripts de base de datos por separado, solo un comando para poner todo en marcha cuando es por primera vez o cuando ya se ha ejecutado. Debe funcionar sin problemas.

### Rutas
- .makia/docs/specs/apps/infrastructure/
- apps/infrastructure/

---

## Estándares que debe cumplir el desarrollo

**Pruebas unitarias.** Toda la lógica de cálculo EVM debe estar cubierta con pruebas unitarias. Esto incluye los casos borde: qué pasa cuando AC es cero, cuando no hay actividades, cuando el avance real es cero. Esperamos una cobertura mínima del 80% sobre la capa de negocio. Cada endpoint debe tener al menos un test de integración que valide el contrato de respuesta.

**Cero code smells.** El código debe estar limpio. Sin bloques comentados, sin variables sin usar, sin números o strings mágicos dispersos por el código. Los nombres de variables, métodos y clases deben ser descriptivos. La lógica de negocio no debe vivir en los controladores. Si una función hace más de una cosa, probablemente deba dividirse. Si un bloque de lógica se repite más de dos veces, debe abstraerse. Recomendamos configurar un linter en el proyecto — si lo haces, incluye la configuración en el repositorio.

**OpenAPI/Swagger.** Valoramos positivamente que el API esté documentado con la especificación OpenAPI. Si lo implementas, debe ser accesible localmente en `/api-docs` o `/swagger-ui`, y cada endpoint debe incluir descripción, esquemas de request y response, y los posibles códigos de error. Hacerlo bien demuestra que entiendes el contrato del API como un artefacto de comunicación, no solo como documentación.

**README.md** con los comandos para correr el proyecto localmente y ejecutar los tests.

## Gitflow estricto

El historial de tu repositorio es parte de la entrega. La estructura de ramas debe seguir el flujo estándar: `main` para producción, `develop` como rama de integración, ramas `feature/*` por cada funcionalidad, y al menos una rama `release/*` antes del merge final a `main`. Cada feature debe integrarse a `develop` mediante un Pull Request, aunque trabajes solo. Los mensajes de commit deben ser descriptivos y en imperativo: `Add EVM calculation service`, `Fix CPI edge case when AC is zero`. Mensajes como `fix`, `cambios` o `wip` no son aceptables.