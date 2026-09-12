import { describe, expect, it } from 'vitest'
import {
  evmIndicatorsCatalog,
  getEvmTooltipContent,
} from './evmIndicatorsCatalog.ts'

describe('evmIndicatorsCatalog', () => {
  it('keeps the EVM acronym (code) fixed and identical to its catalog key regardless of language', () => {
    for (const [key, entry] of Object.entries(evmIndicatorsCatalog)) {
      expect(entry.code).toBe(key)
    }
  })

  it('resolves localized tooltip copy without changing the acronym', () => {
    const es = getEvmTooltipContent('PV', 'es')
    const en = getEvmTooltipContent('PV', 'en')
    expect(es.nameEs).toBe('Valor Planificado')
    expect(en.nameEn).toBe('Planned Value')
    expect(es.description).toBe(evmIndicatorsCatalog.PV.descriptionEs)
    expect(en.description).toBe(evmIndicatorsCatalog.PV.descriptionEn)
  })
})
