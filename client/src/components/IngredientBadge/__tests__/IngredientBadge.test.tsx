import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { IngredientBadge } from '../IngredientBadge'
import { EMPTY_CODE } from '../badgeCode'

expect.extend(toHaveNoViolations)

describe('IngredientBadge', () => {
  it('draws a produce-green circle with TOM and no image file', () => {
    const { container } = render(
      <IngredientBadge
        name="Tomato"
        category="fruit & veg"
      />
    )
    const badge = screen.getByText('TOM')
    expect(badge).toHaveClass('rounded-pill', 'bg-badge-produce')
    expect(badge).toHaveClass('text-badge-produce-ink')
    expect(container.querySelector('img, svg, picture')).toBeNull()
  })

  it('is decorative: hidden from screen readers, no image role or label', () => {
    const { container } = render(
      <IngredientBadge
        name="beef mince"
        category="meat"
      />
    )
    const badge = screen.getByText('BMI')
    expect(badge).toHaveAttribute('aria-hidden', 'true')
    expect(badge).not.toHaveAttribute('role')
    expect(badge).not.toHaveAttribute('aria-label')
    expect(screen.queryByRole('img')).toBeNull()
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
  })

  it('shows the catalogue badgeCode instead of the derived code', () => {
    render(
      <IngredientBadge
        name="full cream milk"
        category="dairy & eggs"
        badgeCode="FCM"
      />
    )
    expect(screen.getByText('FCM')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByText('FMI')).toBeNull()
  })

  it('is a neutral "?" for an item the catalogue does not know, and never focusable', () => {
    render(
      <IngredientBadge
        name="Mystery"
        category="other"
        badgeCode={EMPTY_CODE}
      />
    )
    const badge = screen.getByText('?')
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
