import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import type { MockedResponse } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { logIn } from '../../../test/providers'
import { savedQuery, savedRecipe } from '../../../test/savedMocks'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { ProfilePage, savedNames } from '../ProfilePage'

const Where = () => {
  const { pathname, search } = useLocation()
  return <output aria-label="where">{`${pathname}${search}`}</output>
}

const renderProfile = (mocks: readonly MockedResponse[] = []) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/profile']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/profile"
              element={<ProfilePage />}
            />
            <Route
              path="*"
              element={<p>Elsewhere</p>}
            />
          </Routes>
          <Where />
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

describe('Profile page (#227)', () => {
  beforeEach(() => localStorage.clear())

  it('signed out: Account offers Log in and Sign up, and Saved says to log in', () => {
    renderProfile()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Profile' })
    ).toBeInTheDocument()
    const account = within(screen.getByRole('region', { name: 'Account' }))
    expect(account.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login'
    )
    expect(account.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      '/signup'
    )
    expect(
      within(screen.getByRole('region', { name: 'Saved recipes' })).getByText(
        'Saved recipes show here once you log in.'
      )
    ).toBeInTheDocument()
  })

  it('signed in with nothing saved: says so, and offers Log out', async () => {
    logIn(false)
    renderProfile([savedQuery([])])
    expect(await screen.findByText(/No saved recipes yet/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Log in' })).toBeNull()
  })

  it('signed in: lists the saved recipes by name, with a link to them in Explore', async () => {
    const user = userEvent.setup()
    logIn(false)
    renderProfile([savedQuery([savedRecipe('dahl')])])
    const saved = within(screen.getByRole('region', { name: 'Saved recipes' }))
    expect(await saved.findByText('1 saved recipe')).toBeInTheDocument()
    expect(saved.getByText('Red lentil dahl')).toBeInTheDocument()
    await user.click(
      saved.getByRole('link', { name: 'Open saved recipes in Explore' })
    )
    expect(screen.getByLabelText('where')).toHaveTextContent('/?saved=1')
  })

  it('logging out returns to the signed-out view', async () => {
    const user = userEvent.setup()
    logIn(false)
    renderProfile([savedQuery([])])
    await user.click(screen.getByRole('button', { name: 'Log out' }))
    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
  })

  it('names saved recipes in library order, ignoring unknown ids', () => {
    expect(savedNames(new Set(['dahl', 'nope']))).toEqual(['Red lentil dahl'])
    expect(savedNames(new Set())).toEqual([])
  })
})
