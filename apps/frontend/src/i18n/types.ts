export interface Dictionary {
  common: {
    loading: string
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    errorGeneric: string
    errorNetwork: string
  }
  dashboard: {
    title: string
    selectProject: string
    noProjectsFound: string
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
  }
  activitiesTable: {
    columnActivity: string
    columnBudget: string
    columnPlannedProgress: string
    columnActualProgress: string
    columnActualCost: string
  }
  consolidatedIndicators: {
    title: string
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
}

export type TranslationKey = {
  [D in keyof Dictionary]: `${D & string}.${keyof Dictionary[D] & string}`
}[keyof Dictionary]

export type Locale = 'es' | 'en'
