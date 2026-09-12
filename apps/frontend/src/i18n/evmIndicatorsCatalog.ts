export type EvmLocale = 'es' | 'en'

export type EvmIndicatorCode =
  | 'PV'
  | 'EV'
  | 'AC'
  | 'CV'
  | 'SV'
  | 'CPI'
  | 'SPI'
  | 'EAC'
  | 'VAC'
  | 'BAC'
  | 'ETC'
  | 'TCPI'

export interface EvmIndicatorCatalogEntry {
  code: EvmIndicatorCode
  nameEs: string
  nameEn: string
  descriptionEs: string
  descriptionEn: string
  formula?: string
}

export const evmIndicatorsCatalog: Record<
  EvmIndicatorCode,
  EvmIndicatorCatalogEntry
> = {
  PV: {
    code: 'PV',
    nameEs: 'Valor Planificado',
    nameEn: 'Planned Value',
    descriptionEs: 'Valor presupuestado del trabajo programado a la fecha.',
    descriptionEn: 'Budgeted value of the work scheduled to date.',
  },
  EV: {
    code: 'EV',
    nameEs: 'Valor Ganado',
    nameEn: 'Earned Value',
    descriptionEs: 'Valor presupuestado del trabajo realmente completado.',
    descriptionEn: 'Budgeted value of the work actually completed.',
  },
  AC: {
    code: 'AC',
    nameEs: 'Costo Real',
    nameEn: 'Actual Cost',
    descriptionEs: 'Costo realmente incurrido por el trabajo completado.',
    descriptionEn: 'Cost actually incurred for the work completed.',
  },
  CV: {
    code: 'CV',
    nameEs: 'Variación de Costo',
    nameEn: 'Cost Variance',
    descriptionEs: 'Diferencia entre el valor ganado y el costo real.',
    descriptionEn: 'Difference between earned value and actual cost.',
    formula: 'CV = EV - AC',
  },
  SV: {
    code: 'SV',
    nameEs: 'Variación de Cronograma',
    nameEn: 'Schedule Variance',
    descriptionEs: 'Diferencia entre el valor ganado y el valor planificado.',
    descriptionEn: 'Difference between earned value and planned value.',
    formula: 'SV = EV - PV',
  },
  CPI: {
    code: 'CPI',
    nameEs: 'Índice de Desempeño del Costo',
    nameEn: 'Cost Performance Index',
    descriptionEs: 'Eficiencia de costo del trabajo realizado.',
    descriptionEn: 'Cost efficiency of the work performed.',
    formula: 'CPI = EV / AC',
  },
  SPI: {
    code: 'SPI',
    nameEs: 'Índice de Desempeño del Cronograma',
    nameEn: 'Schedule Performance Index',
    descriptionEs: 'Eficiencia de cronograma del trabajo realizado.',
    descriptionEn: 'Schedule efficiency of the work performed.',
    formula: 'SPI = EV / PV',
  },
  EAC: {
    code: 'EAC',
    nameEs: 'Estimación a la Conclusión',
    nameEn: 'Estimate at Completion',
    descriptionEs: 'Costo total esperado al finalizar el trabajo.',
    descriptionEn: 'Expected total cost of the work when completed.',
    formula: 'EAC = BAC / CPI',
  },
  VAC: {
    code: 'VAC',
    nameEs: 'Variación a la Conclusión',
    nameEn: 'Variance at Completion',
    descriptionEs:
      'Diferencia proyectada entre presupuesto y costo final estimado.',
    descriptionEn:
      'Projected difference between budget and estimated final cost.',
    formula: 'VAC = BAC - EAC',
  },
  BAC: {
    code: 'BAC',
    nameEs: 'Presupuesto a la Conclusión',
    nameEn: 'Budget at Completion',
    descriptionEs: 'Presupuesto total aprobado para el trabajo.',
    descriptionEn: 'Total approved budget for the work.',
  },
  ETC: {
    code: 'ETC',
    nameEs: 'Estimación hasta la Conclusión',
    nameEn: 'Estimate to Complete',
    descriptionEs: 'Costo esperado para terminar el trabajo restante.',
    descriptionEn: 'Expected cost to finish the remaining work.',
    formula: 'ETC = EAC - AC',
  },
  TCPI: {
    code: 'TCPI',
    nameEs: 'Índice de Desempeño del Trabajo por Completar',
    nameEn: 'To-Complete Performance Index',
    descriptionEs:
      'Eficiencia de costo requerida para completar el trabajo restante dentro del presupuesto.',
    descriptionEn:
      'Cost efficiency required to finish the remaining work within budget.',
    formula: 'TCPI = (BAC - EV) / (BAC - AC)',
  },
}

export function getEvmTooltipContent(
  code: EvmIndicatorCode,
  locale: EvmLocale,
) {
  const entry = evmIndicatorsCatalog[code]
  return {
    nameEs: entry.nameEs,
    nameEn: entry.nameEn,
    description: locale === 'es' ? entry.descriptionEs : entry.descriptionEn,
    formula: entry.formula,
  }
}
