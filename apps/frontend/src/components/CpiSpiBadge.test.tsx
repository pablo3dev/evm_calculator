import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CpiSpiBadge } from './CpiSpiBadge'

describe('CpiSpiBadge', () => {
  it('renders interpretation text', () => {
    render(<CpiSpiBadge value={1.2} interpretation="Dentro del presupuesto" />)

    expect(screen.getByText('Dentro del presupuesto')).toBeInTheDocument()
  })
})
