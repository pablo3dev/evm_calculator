import type { Dictionary } from './types.ts'

export const dictionary: Dictionary = {
  common: {
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    errorGeneric: 'Ocurrió un error inesperado',
    errorNetwork: 'Error de red. Verifica tu conexión.',
  },
  dashboard: {
    title: 'Panel EVM',
    selectProject: 'Seleccionar proyecto',
    noProjectsFound: 'No se encontraron proyectos',
  },
  activityForm: {
    titleCreate: 'Nueva actividad',
    titleEdit: 'Editar actividad',
    fieldName: 'Nombre',
    fieldBudgetAtCompletion: 'Presupuesto a la conclusión',
    fieldPlannedProgress: 'Avance planificado (%)',
    fieldActualProgress: 'Avance real (%)',
    fieldActualCost: 'Costo real',
    submitLabel: 'Guardar',
  },
  activitiesTable: {
    columnActivity: 'Actividad',
    columnBudget: 'Presupuesto',
    columnPlannedProgress: 'Avance planificado',
    columnActualProgress: 'Avance real',
    columnActualCost: 'Costo real',
  },
  consolidatedIndicators: {
    title: 'Indicadores consolidados',
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
}
