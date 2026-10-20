import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  keyIngredient,
  unknownIngredient
} from '../../../utils/library/keyIngredients'
import { KeyIngredientList, keyNameId, keyNameIds } from '../KeyIngredients'

expect.extend(toHaveNoViolations)

const items = [keyIngredient('beef-mince'), unknownIngredient('dragon-fruit')]

describe('KeyIngredientList', () => {
  it('shows each badge beside its full name, with the section as text under it', () => {
    render(
      <KeyIngredientList
        items={items}
        idPrefix="k"
      />
    )
    const [beef, other] = screen.getAllByRole('listitem')
    const row = within(beef ?? document.body)
    expect(row.getByText('BEF')).toHaveAttribute('aria-hidden', 'true')
    expect(row.getByText('Beef mince')).toHaveAttribute(
      'id',
      'k-key-beef-mince'
    )
    expect(row.getByText('Meat & Seafood')).toBeInTheDocument()
    const unknown = within(other ?? document.body)
    expect(unknown.getByText('?')).toHaveClass('bg-badge-neutral')
    expect(unknown.getByText('Dragon fruit')).toBeInTheDocument()
    expect(unknown.getByText('Other')).toBeInTheDocument()
  })

  it('points descriptions at the names only', () => {
    expect(keyNameId('p', items[0] ?? unknownIngredient('x'))).toBe(
      'p-key-beef-mince'
    )
    expect(keyNameIds('p', items)).toBe('p-key-beef-mince p-key-dragon-fruit')
    expect(keyNameIds('p', [])).toBe('')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <KeyIngredientList
        items={items}
        idPrefix="k"
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
