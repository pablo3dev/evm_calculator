import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n/I18nProvider.tsx'
import { useI18n } from '../i18n/useI18n.ts'
import { LanguageSwitcher } from './LanguageSwitcher'

function Consumer() {
  const { t } = useI18n()
  return <p>{t('dashboard.title')}</p>
}

function Harness() {
  return (
    <I18nProvider>
      <LanguageSwitcher />
      <Consumer />
    </I18nProvider>
  )
}

describe('LanguageSwitcher', () => {
  it('switches the active locale and updates consumer text when clicking EN/ES', () => {
    render(<Harness />)

    const esButton = screen.getByRole('button', { name: 'ES' })
    const enButton = screen.getByRole('button', { name: 'EN' })

    fireEvent.click(enButton)

    expect(screen.getByText('EVM Dashboard')).toBeInTheDocument()
    expect(enButton).toHaveAttribute('aria-pressed', 'true')
    expect(esButton).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(esButton)

    expect(screen.getByText('Panel EVM')).toBeInTheDocument()
    expect(esButton).toHaveAttribute('aria-pressed', 'true')
    expect(enButton).toHaveAttribute('aria-pressed', 'false')
  })
})
