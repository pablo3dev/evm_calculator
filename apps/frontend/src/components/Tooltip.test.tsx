import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n/I18nProvider.tsx'
import { Tooltip } from './Tooltip'

function renderTooltip() {
  return render(
    <I18nProvider>
      <Tooltip nameEs="Valor Ganado" nameEn="Earned Value" description="desc">
        EV
      </Tooltip>
    </I18nProvider>,
  )
}

describe('Tooltip', () => {
  it('is closed initially, opens on focus, and closes on Escape', () => {
    renderTooltip()

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    const trigger = screen.getByText('EV')
    fireEvent.focus(trigger)

    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.keyDown(trigger, { key: 'Escape' })

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
