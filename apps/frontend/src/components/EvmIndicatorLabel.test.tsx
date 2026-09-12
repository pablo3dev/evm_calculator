import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n/I18nProvider.tsx'
import { EvmIndicatorLabel } from './EvmIndicatorLabel'

describe('EvmIndicatorLabel', () => {
  it('shows only the English abbreviation until hover', () => {
    sessionStorage.setItem('evm_locale', 'en')

    render(
      <I18nProvider>
        <EvmIndicatorLabel code="CPI" />
      </I18nProvider>,
    )

    expect(screen.getByText('CPI')).toBeInTheDocument()
    expect(screen.queryByText('Cost Performance Index')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Índice de Desempeño del Costo'),
    ).not.toBeInTheDocument()

    fireEvent.mouseEnter(screen.getByText('CPI'))

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Cost Performance Index')
    expect(tooltip).toHaveTextContent('CPI = EV / AC')
  })
})
