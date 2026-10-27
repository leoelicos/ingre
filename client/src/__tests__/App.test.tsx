import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  authHeaders,
  graphqlEndpoint,
  Ingre,
  SiteAnalytics,
  withAuthHeaders
} from '../App'

/** Renders the whole app at a path, as a browser would open it. */
const openAt = (path: string) => {
  window.history.pushState({}, '', path)
  return render(<Ingre />)
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('opens on the one page: the header, Recipes, Ingredients and the FAB, no search (#164, #179, #192)', () => {
    openAt('/')
    expect(screen.getByRole('link', { name: 'ingré' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Shopping list' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Explore' })).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Add a recipe' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ingredients' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Recipes' })
    ).toBeInTheDocument()
    expect(screen.queryByText('At home')).not.toBeInTheDocument()
    expect(screen.queryByText('At the shop')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull()
  })

  it('old Saved links open the page with the Saved filter on (#160)', () => {
    openAt('/saved')
    expect(window.location.pathname).toBe('/')
    expect(window.location.search).toBe('?saved=1')
    expect(screen.getByRole('switch', { name: 'Saved' })).toBeChecked()
  })

  it.each(['/ingredients', '/tapoff'])(
    'the old step address %s redirects to the one page (#179)',
    (path) => {
      openAt(`${path}?q=dahl`)
      expect(window.location.pathname).toBe('/')
      expect(window.location.search).toBe('?q=dahl')
      expect(
        screen.getByRole('heading', { level: 1, name: 'Shopping list' })
      ).toBeInTheDocument()
    }
  )

  it('builds the graphql endpoint for each environment', () => {
    expect(graphqlEndpoint('production', '')).toBe(
      'https://ingre-backend.onrender.com/graphql'
    )
    expect(graphqlEndpoint('test', '')).toBe('http://localhost:3001/graphql')
    expect(graphqlEndpoint('development', '')).toBe(
      'http://localhost:3001/graphql'
    )
  })

  it('uses the override when one is set (the e2e server)', () => {
    expect(
      graphqlEndpoint('development', 'http://localhost:4311/graphql')
    ).toBe('http://localhost:4311/graphql')
  })

  it('adds a bearer token when one is stored', () => {
    localStorage.setItem('id_token', 'abc')
    expect(authHeaders({ accept: 'json' })).toEqual({
      headers: { accept: 'json', authorization: 'Bearer abc' }
    })
    expect(
      withAuthHeaders({}, { headers: { accept: 'json' } }).headers[
        'authorization'
      ]
    ).toBe('Bearer abc')
  })

  it('uses an empty authorization header without a token', () => {
    expect(authHeaders(undefined)).toEqual({ headers: { authorization: '' } })
    expect(withAuthHeaders({}, {}).headers['authorization']).toBe('')
  })
})

describe('App skip link (#131)', () => {
  it('the first Tab on a page lands on "Skip to content", which targets the main landmark', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/login')
    render(<Ingre />)
    await user.tab()
    const link = screen.getByRole('link', { name: 'Skip to content' })
    expect(link).toHaveFocus()
    await user.click(link)
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('on the list page, Skip to content lands on the list column, beside the Explore drawer (#131, #181)', async () => {
    const user = userEvent.setup()
    openAt('/')
    await user.tab()
    await user.keyboard('{Enter}')
    const main = screen.getByRole('main')
    expect(main).toHaveFocus()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(main).toContainElement(
      screen.getByRole('heading', { level: 2, name: 'Ingredients' })
    )
  })
})

describe('SiteAnalytics (#177)', () => {
  const insightsScripts = () =>
    Array.from(document.querySelectorAll('script')).filter((s) =>
      /insights|vercel-scripts/.test(s.src)
    )

  it('renders nothing outside the production build', () => {
    const { container } = render(<SiteAnalytics mode="test" />)
    expect(container).toBeEmptyDOMElement()
    expect(insightsScripts()).toEqual([])
  })

  it('adds the Vercel Analytics script in the production build', async () => {
    render(<SiteAnalytics mode="production" />)
    await waitFor(() => {
      expect(insightsScripts()).toHaveLength(1)
    })
  })
})
