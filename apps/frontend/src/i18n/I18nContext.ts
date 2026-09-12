import { createContext } from 'react'
import type { Locale, TranslationKey } from './types.ts'

export interface I18nContextValue {
  locale: Locale
  setLocale: (nextLocale: Locale) => void
  t: (key: TranslationKey) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
