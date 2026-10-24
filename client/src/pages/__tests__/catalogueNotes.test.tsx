import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ingredientData from '../../data/ingredients.json'
import recipeData from '../../data/recipes.json'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { StoreProvider } from '../../utils/state/GlobalState'
import { PICKED_KEY } from '../../utils/storage/shoppingState'
import RecipePage from '../Recipe/RecipePage'
import { ListPage } from '../List/ListPage'

/** Internal data notes (sizes, sources, flags) are for us, never for shoppers. */
const INTERNAL = /unverified|estimate|draft|verified against|\bPO\b|_note/i

const renderAt = (path: string, pattern: string, page: ReactElement) =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <StoreProvider>
            <Routes>
              <Route
                path={pattern}
                element={page}
              />
            </Routes>
          </StoreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

const shownText = (container: HTMLElement) =>
  `${container.textContent ?? ''} ${Array.from(
    container.querySelectorAll('[aria-label],[title]'),
    (el) =>
      `${el.getAttribute('aria-label') ?? ''} ${el.getAttribute('title') ?? ''}`
  ).join(' ')}`

beforeEach(() => localStorage.clear())

describe('catalogue notes stay internal', () => {
  it('the data does carry internal notes (so the checks below mean something)', () => {
    expect(ingredientData._note).toMatch(/UNVERIFIED/)
    expect(ingredientData._note).toMatch(/pork-loin-chop/)
    expect(recipeData._note.length).toBeGreaterThan(0)
  })

  it('the pork chops recipe page shows no note text', () => {
    const { container } = renderAt(
      '/recipe/pork-chops-apple-onion',
      '/recipe/:id',
      <RecipePage />
    )
    expect(container).toHaveTextContent('Pork chops with apples and onion')
    expect(shownText(container)).not.toMatch(INTERNAL)
  })

  it('the shopping list, with the recipe row open, shows no note text', () => {
    localStorage.setItem(PICKED_KEY, JSON.stringify(['pork-chops-apple-onion']))
    const { container } = renderAt('/', '/', <ListPage />)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Pork chops with apples and onion details'
      })
    )
    expect(screen.getByRole('heading', { name: 'Method' })).toBeVisible()
    expect(shownText(container)).not.toMatch(INTERNAL)
  })
})
