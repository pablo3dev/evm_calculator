import type { Dictionary } from './types.ts'

export const dictionary: Dictionary = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    errorGeneric: 'An unexpected error occurred',
    errorNetwork: 'Network error. Check your connection.',
  },
  dashboard: {
    title: 'EVM Dashboard',
    selectProject: 'Select project',
    noProjectsFound: 'No projects found',
  },
  activityForm: {
    titleCreate: 'New activity',
    titleEdit: 'Edit activity',
    fieldName: 'Name',
    fieldBudgetAtCompletion: 'Budget at completion',
    fieldPlannedProgress: 'Planned progress (%)',
    fieldActualProgress: 'Actual progress (%)',
    fieldActualCost: 'Actual cost',
    submitLabel: 'Save',
  },
  activitiesTable: {
    columnActivity: 'Activity',
    columnBudget: 'Budget',
    columnPlannedProgress: 'Planned progress',
    columnActualProgress: 'Actual progress',
    columnActualCost: 'Actual cost',
  },
  consolidatedIndicators: {
    title: 'Consolidated indicators',
  },
  cpiSpiBadge: {
    cpiLabel: 'CPI',
    spiLabel: 'SPI',
  },
  languageSwitcher: {
    labelEs: 'ES',
    labelEn: 'EN',
    ariaLabel: 'Language selector',
  },
  evmInterpretation: {
    cpiNull: 'No actual cost recorded — CPI not applicable',
    cpiAboveOne: 'Under budget',
    cpiEqualOne: 'On budget',
    cpiBelowOne: 'Over budget',
    spiNull: 'No planned progress to date — SPI not applicable',
    spiAboveOne: 'Ahead of schedule',
    spiEqualOne: 'On schedule',
    spiBelowOne: 'Behind schedule',
  },
}
