import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { BottomNav } from '../../../components/BottomNav/BottomNav'
import { Header } from '../../../components/Header'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { ExploreProvider } from '../../../utils/explore/ExploreContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import { ListPage } from '../ListPage'
import { ARRIVALS } from '../tabArrival'

const scrolls: string[] = []
const tops: ScrollToOptions[] = []

const renderApp = (path: string) =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <StoreProvider>
            <ExploreProvider>
              <Header />
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
              <BottomNav />
            </ExploreProvider>
          </StoreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )
const tab = (name: string) =>
  within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', {
    name
  })

beforeEach(() => {
  localStorage.clear()
  scrolls.length = 0
  tops.length = 0
  Element.prototype.scrollIntoView = function () {
    scrolls.push(this.id)
  }
  window.scrollTo = (options?: ScrollToOptions | number) => {
    if (typeof options === 'object') tops.push(options)
  }
})

describe('arriving from a tab (#227)', () => {
  it('knows where Inventory and Cook land', () => {
    expect(ARRIVALS['#inventory']).toEqual({
      sectionId: 'ingredients',
      headingId: 'ingredients-heading'
    })
    expect(ARRIVALS['#cook']).toEqual({
      sectionId: 'recipes',
      headingId: 'recipes-heading'
    })
  })

  it('Cook: scrolls to Recipes and focuses its heading', async () => {
    const user = userEvent.setup()
    renderApp('/')
    expect(scrolls).toEqual([])
    await user.click(tab('Cook'))
    expect(scrolls).toEqual(['recipes'])
    expect(
      screen.getByRole('heading', { level: 2, name: /^Recipes/ })
    ).toHaveFocus()
  })

  it('Inventory: scrolls to Ingredients and focuses its heading, again each time it is pressed', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(tab('Inventory'))
    await user.click(tab('Inventory'))
    expect(scrolls).toEqual(['ingredients', 'ingredients'])
    expect(
      screen.getByRole('heading', { level: 2, name: /^Ingredients/ })
    ).toHaveFocus()
  })

  it('Explore: back to the top, Explore expanded, search focused', async () => {
    const user = userEvent.setup()
    renderApp('/#cook')
    expect(scrolls).toEqual(['recipes'])
    await user.click(tab('Explore'))
    expect(tops).toEqual([{ top: 0, behavior: 'smooth' }])
    expect(screen.getByRole('region', { name: 'Explore' })).toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', { name: 'Search ingredients and recipes' })
    ).toHaveFocus()
  })

  it('opening the page without a tab moves nothing', () => {
    renderApp('/')
    expect(scrolls).toEqual([])
    expect(tops).toEqual([])
  })
})
