import { useI18n } from '../i18n/useI18n.ts'
import type { Locale } from '../i18n/types.ts'
import styles from './LanguageSwitcher.module.css'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  const buttonClassName = (buttonLocale: Locale) =>
    `${styles.button}${locale === buttonLocale ? ` ${styles.active}` : ''}`

  return (
    <div
      role="group"
      aria-label={t('languageSwitcher.ariaLabel')}
      className={styles.group}
    >
      <button
        type="button"
        className={buttonClassName('es')}
        aria-pressed={locale === 'es'}
        onClick={() => setLocale('es')}
      >
        {t('languageSwitcher.labelEs')}
      </button>
      <button
        type="button"
        className={buttonClassName('en')}
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        {t('languageSwitcher.labelEn')}
      </button>
    </div>
  )
}
