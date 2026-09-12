import { describe, expect, it } from 'vitest'
import { evmIndicatorsCatalog } from './evmIndicatorsCatalog.ts'

describe('evmIndicatorsCatalog', () => {
  it('keeps the EVM acronym (code) fixed and identical to its catalog key regardless of language', () => {
    for (const [key, entry] of Object.entries(evmIndicatorsCatalog)) {
      expect(entry.code).toBe(key)
    }
  })
})
