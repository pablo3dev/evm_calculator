import type { Dictionary } from './types.ts'

export const dictionary: Dictionary = {
  common: {
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    close: 'Cerrar',
    errorGeneric: 'Ocurrió un error inesperado',
    errorNetwork: 'Error de red. Verifica tu conexión.',
  },
  dashboard: {
    title: 'Panel EVM',
    selectProject: 'Seleccionar proyecto',
    noProjectsFound: 'No se encontraron proyectos',
    ariaLabel: 'Panel del proyecto',
    selectProjectPrompt: 'Selecciona un proyecto para ver el panel.',
    activitiesTitle: 'Actividades',
    errorLoadFailed: 'No se pudieron cargar los datos del panel.',
  },
  activityForm: {
    titleCreate: 'Nueva actividad',
    titleEdit: 'Editar actividad',
    fieldName: 'Nombre',
    fieldBudgetAtCompletion: 'Presupuesto a la conclusión (BAC)',
    fieldPlannedProgress: 'Avance planificado (%)',
    fieldActualProgress: 'Avance real (%)',
    fieldActualCost: 'Costo real (AC)',
    submitLabel: 'Guardar',
    submitLabelCreate: 'Crear actividad',
    submitLabelEdit: 'Guardar cambios',
    confirmDelete:
      'Eliminar la actividad "{name}"? Esta acción no se puede deshacer.',
    fallbackName: 'esta actividad',
    errorSaveFailed: 'No se pudo guardar la actividad.',
  },
  activitiesTable: {
    columnActivity: 'Actividad',
    columnBudget: 'Presupuesto',
    columnPlannedProgress: 'Avance planificado',
    columnActualProgress: 'Avance real',
    columnActualCost: 'Costo real',
    columnActions: 'Acciones',
    emptyState:
      'Aún no hay actividades. Agrega una actividad para ver los indicadores EVM.',
  },
  consolidatedIndicators: {
    title: 'Indicadores consolidados',
    ariaLabel: 'Indicadores consolidados del proyecto',
  },
  cpiSpiBadge: {
    cpiLabel: 'CPI',
    spiLabel: 'SPI',
  },
  languageSwitcher: {
    labelEs: 'ES',
    labelEn: 'EN',
    ariaLabel: 'Selector de idioma',
  },
  evmInterpretation: {
    cpiNull: 'Sin costo real registrado — CPI no aplicable',
    cpiAboveOne: 'Bajo presupuesto',
    cpiEqualOne: 'En presupuesto',
    cpiBelowOne: 'Sobre presupuesto',
    spiNull: 'Sin avance planificado a la fecha — SPI no aplicable',
    spiAboveOne: 'Adelantado',
    spiEqualOne: 'En plan',
    spiBelowOne: 'Atrasado',
  },
  projectSelector: {
    errorLoadFailed: 'No se pudieron cargar los proyectos.',
    createdLabel: 'Creado',
    updatedLabel: 'Actualizado',
  },
  projectForm: {
    titleCreate: 'Nuevo proyecto',
    titleEdit: 'Editar proyecto',
    fieldName: 'Nombre',
    fieldDescription: 'Descripción (opcional)',
    submitLabelCreate: 'Crear proyecto',
    submitLabelEdit: 'Guardar cambios',
    confirmDelete:
      'Eliminar el proyecto "{name}"? Esta acción no se puede deshacer.',
    errorSaveFailed: 'No se pudo guardar el proyecto.',
  },
  pvEvAcChart: {
    title: 'PV / EV / AC por actividad',
    ariaLabel: 'Gráfico comparativo de PV, EV y AC',
    emptyState:
      'No hay actividades para graficar. Agrega actividades para comparar PV, EV y AC.',
  },
}
