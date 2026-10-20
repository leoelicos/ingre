import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { IngredientBadge } from '../IngredientBadge'

expect.extend(toHaveNoViolations)

describe('IngredientBadge', () => {
  it('draws a produce-green circle with TOM and no image file', () => {
    const { container } = render(
      <IngredientBadge
        name="Tomato"
        category="fruit & veg"
      />
    )
    const badge = screen.getByRole('img', { name: 'Tomato' })
    expect(badge).toHaveTextContent('TOM')
    expect(badge).toHaveClass('rounded-pill', 'bg-badge-produce')
    expect(badge).toHaveClass('text-badge-produce-ink')
    expect(container.querySelector('img, svg, picture')).toBeNull()
  })

  it('reads the full name, not the code', () => {
    render(
      <IngredientBadge
        name="beef mince"
        category="meat"
      />
    )
    expect(screen.getByRole('img')).toHaveAccessibleName('beef mince')
    expect(screen.getByText('BMI')).toHaveAttribute('aria-hidden', 'true')
  })

  it('is neutral for an unknown section and is never focusable', () => {
    render(
      <IngredientBadge
        name="Mystery"
        category="other"
      />
    )
    const badge = screen.getByRole('img', { name: 'Mystery' })
    expect(badge).toHaveClass('bg-badge-neutral', 'text-badge-neutral-ink')
    expect(badge).not.toHaveAttribute('tabindex')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <IngredientBadge
        name="Tomato"
        category="fruit & veg"
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
