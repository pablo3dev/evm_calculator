import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { dictionary as enDictionary } from './en.ts'
import { dictionary as esDictionary } from './es.ts'
import { I18nContext } from './I18nContext.ts'
import type { I18nContextValue } from './I18nContext.ts'
import type { Dictionary, Locale, TranslationKey } from './types.ts'

const STORAGE_KEY = 'evm_locale'

const DICTIONARIES: Record<Locale, Dictionary> = {
  en: enDictionary,
  es: esDictionary,
}

function isLocale(value: string | null | undefined): value is Locale {
  return value === 'es' || value === 'en'
}

function localeFromLanguageTag(tag: string | undefined): Locale | null {
  const prefix = tag?.split('-')[0]?.toLowerCase()
  return prefix === 'es' || prefix === 'en' ? prefix : null
}

function detectInitialLocale(): Locale {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (isLocale(stored)) {
      return stored
    }
  } catch {
    // sessionStorage may be unavailable (privacy mode, disabled storage); fall through.
  }

  const candidates = [navigator.language, ...(navigator.languages ?? [])]
  for (const candidate of candidates) {
    const detected = localeFromLanguageTag(candidate)
    if (detected) {
      return detected
    }
  }

  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale)

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
    try {
      sessionStorage.setItem(STORAGE_KEY, nextLocale)
    } catch {
      // sessionStorage may be unavailable (privacy mode, disabled storage); ignore.
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      const [namespace, entry] = key.split('.') as [keyof Dictionary, string]
      const namespaceEntries = DICTIONARIES[locale][namespace] as Record<
        string,
        string
      >
      return namespaceEntries[entry]
    },
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
