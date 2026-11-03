import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  explore,
  groupOf,
  hasChipEl,
  region,
  renderList,
  searchBox
} from '../../../test/renderList'

/* #231: gloves, kitchen paper and a saucepan go on the list like any ingredient. */

expect.extend(toHaveNoViolations)
beforeEach(() => localStorage.clear())

const search = async (user: ReturnType<typeof userEvent.setup>, q: string) => {
  await user.click(searchBox())
  await user.paste(q)
}

describe('non-food items (#231)', () => {
  it('a search finds them and says they are not food', async () => {
    const user = userEvent.setup()
    renderList()
    await search(user, 'gloves')
    const result = explore().getByRole('button', {
      name: 'Add disposable gloves'
    })
    expect(result).toHaveTextContent('Household & kitchen · not food')
  })

  it('adding one puts it in Ingredients and Extra, under Household & kitchen', async () => {
    const user = userEvent.setup()
    Element.prototype.scrollIntoView = () => undefined
    renderList()
    await search(user, 'saucepan')
    await user.click(explore().getByRole('button', { name: 'Add saucepan' }))
    expect(hasChipEl('saucepan')).toBe(1)
    expect(hasChipEl('saucepan', 'extra')).toBe(1)
    expect(groupOf('saucepan')).toBe('Household & kitchen')
    expect(
      explore().getByRole('button', { name: 'Saucepan, on your list' })
    ).toHaveTextContent('not food · on your list')
  })

  it('food results do not say not food', async () => {
    const user = userEvent.setup()
    renderList()
    await search(user, 'banana')
    expect(
      explore().getByRole('button', { name: 'Add banana' })
    ).not.toHaveTextContent('not food')
  })

  it('has no accessibility violations with a non-food chip on the list', async () => {
    const user = userEvent.setup()
    Element.prototype.scrollIntoView = () => undefined
    const { container } = renderList()
    await search(user, 'kitchen paper')
    await user.click(
      explore().getByRole('button', { name: 'Add kitchen paper' })
    )
    expect(region('Ingredients')).toBeVisible()
    expect(screen.getAllByText('Kitchen paper').length).toBeGreaterThan(0)
    expect(await axe(container)).toHaveNoViolations()
  })
})
