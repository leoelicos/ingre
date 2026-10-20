import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { ClientRecipe } from '../../../../types/client'
import { searchLibrary } from '../../../../utils/library/recipeLibrary'
import { omit, recipe } from '../../../../test/fixtures'
import {
  PICKED_MARK,
  PickCardGrid,
  VIEW_RECIPE,
  pickId,
  viewRecipeLabel
} from '../PickCard'

expect.extend(toHaveNoViolations)

const library = searchLibrary()

/** The Pick grid with real picking state, as the shopping list keeps it. */
const Picker = ({ recipes }: { recipes: readonly ClientRecipe[] }) => {
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set())
  const onToggle = (id: string) =>
    setPicked((now) =>
      now.has(id)
        ? new Set([...now].filter((x) => x !== id))
        : new Set([...now, id])
    )
  return (
    <MemoryRouter>
      <PickCardGrid
        recipes={recipes}
        pick={{ pickedIds: picked, onToggle }}
      />
    </MemoryRouter>
  )
}

const card = (name: string) => screen.getByRole('button', { name })

describe('PickCard (#156)', () => {
  it('shows only the title and the key ingredient badges: no link, heart, picture or local name inside the toggle', () => {
    render(<Picker recipes={library} />)
    const shaking = card('Shaking beef')
    expect(shaking).toHaveTextContent(
      /^Shaking beefBSTBeef rump steakMeat & SeafoodRONRed onionFruit & VegLIMLimeFruit & Veg$/
    )
    expect(screen.queryByText('bò lúc lắc')).toBeNull()
    expect(within(shaking).queryByRole('link')).toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
    expect(shaking.querySelector('svg, img, button, a')).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(library.length)
  })

  it('is a real toggle button: named by its title, described by its ingredient names', () => {
    render(<Picker recipes={library} />)
    const bolognese = card('Spaghetti bolognese')
    expect(bolognese.tagName).toBe('BUTTON')
    expect(bolognese).toHaveAttribute('type', 'button')
    expect(bolognese).toHaveAttribute('aria-pressed', 'false')
    expect(bolognese).toHaveAccessibleDescription(
      'Spaghetti Beef mince Canned crushed tomatoes'
    )
    within(bolognese)
      .getAllByText(/^[A-Z]{3}$/)
      .forEach((badge) => expect(badge).toHaveAttribute('aria-hidden', 'true'))
    expect(bolognese).toHaveClass('focus-visible:focus-ring')
  })

  it('a tap toggles it on, visibly marked, and off again', () => {
    render(<Picker recipes={library} />)
    const dahl = card('Red lentil dahl')
    fireEvent.click(dahl)
    expect(dahl).toHaveAttribute('aria-pressed', 'true')
    expect(dahl).toHaveClass('aria-pressed:border-primary')
    expect(within(dahl).getByText(PICKED_MARK)).toHaveAttribute(
      'aria-hidden',
      'true'
    )
    expect(card('Red lentil dahl')).toBe(dahl)
    fireEvent.click(dahl)
    expect(dahl).toHaveAttribute('aria-pressed', 'false')
    expect(within(dahl).queryByText(PICKED_MARK)).toBeNull()
  })

  it('Space and Enter toggle the focused card; Tab moves card to card', async () => {
    const user = userEvent.setup()
    render(<Picker recipes={library.slice(0, 2)} />)
    await user.tab()
    const first = card('Spaghetti bolognese')
    expect(first).toHaveFocus()
    await user.keyboard(' ')
    expect(first).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{Enter}')
    expect(first).toHaveAttribute('aria-pressed', 'false')
    await user.tab()
    expect(
      screen.getByRole('link', { name: viewRecipeLabel('Spaghetti bolognese') })
    ).toHaveFocus()
    await user.tab()
    expect(card('Egg fried rice')).toHaveFocus()
  })

  it('each card is followed by its own View recipe link, a sibling of the toggle', () => {
    render(<Picker recipes={library} />)
    const shaking = card('Shaking beef')
    const link = screen.getByRole('link', {
      name: viewRecipeLabel('Shaking beef')
    })
    expect(link).toHaveAccessibleName('View recipe: Shaking beef')
    expect(link).toHaveTextContent(new RegExp(`^${VIEW_RECIPE}$`))
    expect(link).toHaveAttribute('href', '/recipe/shaking-beef')
    expect(link).toHaveClass('focus-visible:focus-ring')
    expect(shaking.contains(link)).toBe(false)
    expect(link.parentElement).toBe(shaking.parentElement)
    expect(shaking.nextElementSibling).toBe(link)
    expect(screen.getAllByRole('link')).toHaveLength(library.length)
  })

  it('a recipe outside the library has no badges or description and picks by name', () => {
    const plain = omit(recipe({ name: 'Plain (local)' }), 'libraryId')
    render(<Picker recipes={[plain]} />)
    const only = card('Plain')
    expect(only).not.toHaveAttribute('aria-describedby')
    expect(only).toHaveTextContent(/^Plain$/)
    // no library page to open
    expect(screen.queryByRole('link')).toBeNull()
    expect(pickId(plain)).toBe('Plain (local)')
    fireEvent.click(only)
    expect(only).toHaveAttribute('aria-pressed', 'true')
  })

  it('has no axe violations, picked or not', async () => {
    const { container } = render(<Picker recipes={library.slice(0, 3)} />)
    fireEvent.click(card('Egg fried rice'))
    expect(await axe(container)).toHaveNoViolations()
  })
})
