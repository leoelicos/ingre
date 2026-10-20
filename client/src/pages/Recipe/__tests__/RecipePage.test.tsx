import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Home from '../../Home/Home'
import RecipePage, {
  KeyIngredients,
  findRecipe,
  recipeMeta
} from '../RecipePage'
import { libRecipe } from '../../../test/fixtures'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import { FAVOURITES_KEY } from '../../../utils/storage/favourites'
import { HAVE_KEY, PICKED_KEY } from '../../../utils/storage/shoppingState'
import { usesLabel } from '../../../utils/shopping/shoppingList'

addFontAwesome()

const renderAt = (path: string) =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <StoreProvider>
            <Routes>
              <Route
                path="/"
                element={<Home />}
              />
              <Route
                path="/recipe/:id"
                element={<RecipePage />}
              />
              <Route
                path="/ingredients"
                element={<p>List page</p>}
              />
            </Routes>
          </StoreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

beforeEach(() => localStorage.clear())

describe('recipe helpers', () => {
  it('meta is tags only; finds by id; uses joins amounts', () => {
    expect(recipeMeta(['Indian', 'dinner'])).toBe('Indian · dinner')
    expect(findRecipe('dahl')?.id).toBe('dahl')
    expect(findRecipe('nope')).toBeNull()
    expect(
      usesLabel({
        name: 'egg',
        parts: [
          { ingredientId: 'x', recipe: 'a', quantity: 1.5, measure: 'tbsp' },
          { ingredientId: 'x', recipe: 'b', quantity: 2, measure: 'whole' }
        ]
      })
    ).toBe('uses 1½ tbsp + 2 eggs')
  })
})

describe('RecipePage', () => {
  it('opens from a card, shows the recipe, and goes back', () => {
    renderAt('/')
    // the title is a link to the recipe; tapping it never picks the recipe
    fireEvent.click(screen.getByRole('link', { name: 'Shaking beef' }))
    expect(localStorage.getItem(PICKED_KEY)).toBeNull()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Shaking beef' })
    ).toBeInTheDocument()
    expect(screen.getByText('bò lúc lắc')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(
      screen.getByRole('link', { name: 'Shaking beef' })
    ).toBeInTheDocument()
  })

  /** Codes, names and sections drawn in a card or the recipe page, in order. */
  const badgesIn = (root: HTMLElement) =>
    within(root)
      .getAllByRole('listitem')
      .map((item) => item.textContent)

  it('shows the same key ingredient badges on the card and the recipe page (#155)', () => {
    renderAt('/')
    const link = screen.getByRole('link', { name: 'Shaking beef' })
    // VoiceOver: the title, then the full names of its key ingredients (never the codes)
    expect(link).toHaveAccessibleDescription('Beef rump steak Red onion Lime')
    const card = link.closest('article') ?? document.body
    const onCard = badgesIn(card)
    expect(onCard).toEqual([
      'BSTBeef rump steakMeat & Seafood',
      'RONRed onionFruit & Veg',
      'LIMLimeFruit & Veg'
    ])
    within(card)
      .getAllByText(/^[A-Z?]{1,3}$/)
      .forEach((badge) => expect(badge).toHaveAttribute('aria-hidden', 'true'))
    fireEvent.click(link)
    const region = screen.getByRole('region', { name: 'Key ingredients' })
    expect(badgesIn(region)).toEqual(onCard)
    expect(within(region).getByText('BST')).toHaveClass('bg-badge-meat')
    expect(within(region).getByText('LIM')).toHaveClass('bg-badge-produce')
  })

  it('leaves the Key ingredients section out for a recipe that names none', () => {
    const { container } = render(<KeyIngredients recipe={libRecipe({})} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('names key ingredients in the same casing as the buy list', () => {
    renderAt('/recipe/greek-salad-haloumi')
    const region = screen.getByRole('region', { name: 'Key ingredients' })
    const buy = within(screen.getByRole('region', { name: 'What to buy' }))
    ;['Haloumi', 'Tomatoes', 'Kalamata olives'].forEach((name) => {
      expect(within(region).getByText(name)).toBeInTheDocument()
      expect(buy.getByText(name)).toBeInTheDocument()
    })
  })

  it('shows buy rows, staples, method, serves, heart and the add button', () => {
    renderAt('/recipe/butter-chicken')
    expect(
      screen.getByText('Indian · dinner · gluten-free')
    ).toBeInTheDocument()
    expect(screen.getByText('Contains: milk')).toHaveClass('recipe-allergens')
    expect(screen.getByText('Amounts are in the buy list')).toBeInTheDocument()
    const buy = within(screen.getByRole('region', { name: 'What to buy' }))
    expect(buy.getAllByText(/^uses /).length).toBeGreaterThan(0)
    expect(buy.queryByText(/^You'll also need: /)).toBeNull()
    const steps = within(screen.getByRole('region', { name: 'Method' }))
    expect(steps.getAllByRole('listitem').length).toBeGreaterThan(0)

    const before = buy.getAllByText(/^uses /).map((n) => n.textContent)
    fireEvent.click(screen.getByRole('radio', { name: '3' }))
    expect(buy.getAllByText(/^uses /).map((n) => n.textContent)).not.toEqual(
      before
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save Butter chicken' }))
    expect(localStorage.getItem(FAVOURITES_KEY)).toBe('["butter-chicken"]')

    fireEvent.click(
      screen.getByRole('button', { name: 'Add Butter chicken to list' })
    )
    expect(localStorage.getItem(PICKED_KEY)).toBe('["butter-chicken"]')
    const view = screen.getByRole('link', {
      name: 'Butter chicken is on your list. View list'
    })
    expect(view).toHaveTextContent('✓ Added · View list')
    fireEvent.click(view)
    expect(screen.getByText('List page')).toBeInTheDocument()
  })

  it('shows the amber allergen line under the meta, from every ingredient', () => {
    window.localStorage.setItem(PICKED_KEY, JSON.stringify(['chicken-korma']))
    window.localStorage.setItem(
      HAVE_KEY,
      JSON.stringify(['butter', 'cream', 'natural-yoghurt', 'ground-almonds'])
    )
    const { container } = renderAt('/recipe/chicken-korma')
    const line = screen.getByText('Contains: milk, tree nut (almond)')
    expect(line).toHaveClass('recipe-allergens')
    expect(line.previousElementSibling).toHaveClass('recipe-meta')
    expect(container.querySelectorAll('.recipe-allergens')).toHaveLength(1)
  })

  it("Jess's apple recipe contains milk from the butter", () => {
    renderAt('/recipe/pork-chops-apple-onion')
    expect(
      screen.getByRole('heading', { name: 'Pork chops with apples and onion' })
    ).toBeInTheDocument()
    expect(screen.getByText('Contains: milk')).toHaveClass('recipe-allergens')
  })

  it('renders nothing for a recipe without allergens', () => {
    const { container } = renderAt('/recipe/beef-keema')
    expect(container.querySelector('.recipe-allergens')).toBeNull()
    expect(screen.queryByText(/contains:|allergen/i)).toBeNull()
  })

  it('keeps allergens off the recipe cards', () => {
    renderAt('/')
    expect(screen.queryByText(/contains:/i)).toBeNull()
  })

  it('opened directly, back goes home; unknown ids say so', () => {
    renderAt('/recipe/dahl')
    expect(screen.getByText("You'll also need: salt")).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(
      screen.getByRole('link', { name: 'Red lentil dahl' })
    ).toBeInTheDocument()
    renderAt('/recipe/1')
    expect(
      screen.getByRole('heading', { name: "We couldn't find that recipe" })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Back to Recipes' }))
    expect(
      screen.getAllByRole('link', { name: 'Red lentil dahl' }).length
    ).toBeGreaterThan(0)
  })
})
