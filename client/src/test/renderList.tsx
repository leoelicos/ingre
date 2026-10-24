import { render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import type { MockedResponse } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from '../components/Header'
import { ListPage } from '../pages/List/ListPage'
import { AuthProvider, useAuthContext } from '../utils/auth/AuthContext'
import { ExploreProvider } from '../utils/explore/ExploreContext'
import { StoreProvider } from '../utils/state/GlobalState'
import { newCopy } from '../utils/balance/copies'
import type { RecipeCopy } from '../utils/balance/copies'
import { COPIES_KEY, parseCopies } from '../utils/storage/shoppingState'

/* Shared helpers for the list page tests: the page in its providers, and its parts. */

const TOKEN = `e30.${btoa(
  JSON.stringify({
    data: { firstName: 'Ada', email: 'a@b.c', _id: '1', pro: false },
    exp: Date.now() / 1000 + 3600
  })
)}.sig`

const PretendLogin = () => {
  const [, dispatch] = useAuthContext()
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'LOGIN', data: TOKEN })}
    >
      Pretend login
    </button>
  )
}

const Where = () => {
  const { pathname, search } = useLocation()
  return <output aria-label="where">{`${pathname}${search}`}</output>
}

/** The header and the list page at `path`, with a way to sign in and see the URL. */
export const renderList = (path = '/', mocks: readonly MockedResponse[] = []) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <StoreProvider>
            <ExploreProvider>
              <Header />
              <PretendLogin />
              <Routes>
                <Route
                  path="/"
                  element={<ListPage />}
                />
                <Route
                  path="*"
                  element={<p>Elsewhere</p>}
                />
              </Routes>
              <Where />
            </ExploreProvider>
          </StoreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

/** Picks recipes before render: their copies at 2 portions (#182). */
export const pick = (...ids: string[]) =>
  localStorage.setItem(COPIES_KEY, JSON.stringify(ids.map((id) => newCopy(id))))

/** The chip's list item, found by catalogue id. */
export const chip = (id: string, scope = 'chip'): HTMLElement => {
  const found = document.querySelector<HTMLElement>(
    `[data-chip="${id}"][data-scope="${scope}"]`
  )
  if (found === null) throw new Error(`no chip ${id} in ${scope}`)
  return found
}
/** How many chips for `id` show in a scope: "chip" (Ingredients), "extra" or "row-<id>". */
export const hasChipEl = (id: string, scope = 'chip') =>
  document.querySelectorAll(`[data-chip="${id}"][data-scope="${scope}"]`).length
/** The chip's cross-off button: its spoken label is a comma list; the chevron's is not. */
export const toggleOf = (id: string, scope = 'chip'): HTMLElement =>
  within(chip(id, scope)).getByRole('button', { name: /, / })
/** The chip's chevron. */
export const chevronOf = (id: string, scope = 'chip'): HTMLElement =>
  within(chip(id, scope)).getByRole('button', { name: / details$/ })
export const chipOrder = (scope = 'chip') =>
  Array.from(document.querySelectorAll(`[data-scope="${scope}"]`), (el) =>
    el.getAttribute('data-chip')
  )
/** The category heading a chip sits under. */
export const groupOf = (id: string, scope = 'chip') =>
  chip(id, scope).closest('[role="group"]')?.querySelector('h3')?.textContent
export const panel = (name: string) => screen.getByRole('group', { name })
export const region = (name: string) => screen.getByRole('region', { name })
export const explore = () => within(region('Explore'))
export const recipes = () => within(region('Recipes'))
export const ingredientsHeader = () =>
  screen.getByRole('button', { name: /^Ingredients/ })
export const recipesHeader = () =>
  screen.getByRole('button', { name: /^Recipes/ })
export const exploreHeader = () =>
  screen.getByRole('button', { name: /^Explore/ })
export const searchBox = () =>
  screen.getByRole('searchbox', { name: 'Search ingredients and recipes' })
/** Picks a recipe from Explore's browse list. */
export const pickFromExplore = (name: string) =>
  explore().getByRole('button', { name })

/** The stored copies (#182). */
export const storedCopies = (): RecipeCopy[] =>
  parseCopies(JSON.parse(localStorage.getItem(COPIES_KEY) ?? '[]')) ?? []
/** The picked recipe ids, from the stored copies. */
export const pickedIds = (): string[] =>
  storedCopies().map((copy) => copy.recipeId)
