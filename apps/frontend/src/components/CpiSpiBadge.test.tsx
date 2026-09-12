import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n/I18nProvider.tsx'
import { CpiSpiBadge } from './CpiSpiBadge'

describe('CpiSpiBadge', () => {
  it('renders interpretation text derived from the CPI value', () => {
    render(
      <I18nProvider>
        <CpiSpiBadge value={1.2} metric="cpi" />
      </I18nProvider>,
    )

    expect(screen.getByText('Under budget')).toBeInTheDocument()
  })

  it('stacks siglum, icon and interpretation when layout is stacked', () => {
    render(
      <I18nProvider>
        <CpiSpiBadge value={1.2} metric="cpi" label="CPI" layout="stacked" />
      </I18nProvider>,
    )

    expect(
      screen.getByRole('status', { name: 'CPI: Under budget' }),
    ).toHaveAttribute('data-layout', 'stacked')
    expect(screen.getByText('CPI')).toBeInTheDocument()
    expect(screen.getByText('Under budget')).toBeInTheDocument()
  })
})
