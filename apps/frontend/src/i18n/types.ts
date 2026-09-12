export interface Dictionary {
  common: {
    loading: string
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    close: string
    errorGeneric: string
    errorNetwork: string
  }
  dashboard: {
    title: string
    selectProject: string
    noProjectsFound: string
    ariaLabel: string
    selectProjectPrompt: string
    activitiesTitle: string
    errorLoadFailed: string
  }
  activityForm: {
    titleCreate: string
    titleEdit: string
    fieldName: string
    fieldBudgetAtCompletion: string
    fieldPlannedProgress: string
    fieldActualProgress: string
    fieldActualCost: string
    submitLabel: string
    submitLabelCreate: string
    submitLabelEdit: string
    confirmDelete: string
    fallbackName: string
    errorSaveFailed: string
  }
  activitiesTable: {
    columnActivity: string
    columnBudget: string
    columnPlannedProgress: string
    columnActualProgress: string
    columnActualCost: string
    columnActions: string
    emptyState: string
  }
  consolidatedIndicators: {
    title: string
    ariaLabel: string
  }
  cpiSpiBadge: {
    cpiLabel: string
    spiLabel: string
  }
  languageSwitcher: {
    labelEs: string
    labelEn: string
    ariaLabel: string
  }
  evmInterpretation: {
    cpiNull: string
    cpiAboveOne: string
    cpiEqualOne: string
    cpiBelowOne: string
    spiNull: string
    spiAboveOne: string
    spiEqualOne: string
    spiBelowOne: string
  }
  projectSelector: {
    errorLoadFailed: string
    createdLabel: string
    updatedLabel: string
  }
  projectForm: {
    titleCreate: string
    titleEdit: string
    fieldName: string
    fieldDescription: string
    submitLabelCreate: string
    submitLabelEdit: string
    confirmDelete: string
    errorSaveFailed: string
  }
  pvEvAcChart: {
    title: string
    ariaLabel: string
    emptyState: string
  }
}

export type TranslationKey = {
  [D in keyof Dictionary]: `${D & string}.${keyof Dictionary[D] & string}`
}[keyof Dictionary]

export type Locale = 'es' | 'en'
