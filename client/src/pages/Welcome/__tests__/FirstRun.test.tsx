import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { ExploreProvider } from '../../../utils/explore/ExploreContext'
import { FIRST_RUN_KEY } from '../../../utils/firstRun/firstRun'
import { logIn } from '../../../test/providers'
import { FirstRun } from '../FirstRun'
import { Setup } from '../Setup'

beforeEach(() => {
  localStorage.clear()
  HTMLElement.prototype.scrollTo = jest.fn()
})

const renderGate = (path = '/') =>
  render(
    <AuthProvider>
      <ExploreProvider>
        <MemoryRouter initialEntries={[path]}>
          <FirstRun>
            <p>The app</p>
          </FirstRun>
        </MemoryRouter>
      </ExploreProvider>
    </AuthProvider>
  )

describe('FirstRun (#211)', () => {
  it('is a hard stop: the landing first, and not the app', () => {
    renderGate()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Get started' })
    ).toBeInTheDocument()
    expect(screen.queryByText('The app')).not.toBeInTheDocument()
  })

  it('goes landing, the questions, then the app, and remembers it', async () => {
    const user = userEvent.setup()
    renderGate()
    await user.click(screen.getByRole('button', { name: 'Get started' }))
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(screen.getByText('The app')).toBeInTheDocument()
    expect(localStorage.getItem(FIRST_RUN_KEY)).toBe('"done"')
  })

  it('resumes at the questions after a reload', () => {
    localStorage.setItem(FIRST_RUN_KEY, '"tmd"')
    renderGate()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  it('a return visit goes straight in', () => {
    localStorage.setItem(FIRST_RUN_KEY, '"done"')
    renderGate()
    expect(screen.getByText('The app')).toBeInTheDocument()
  })
})

describe('FirstRun, other ways in (#211)', () => {
  it('Log in and Sign up are open on a first visit', () => {
    renderGate('/login')
    expect(screen.getByText('The app')).toBeInTheDocument()
  })

  it('a signed-in user is not made to start again', () => {
    logIn(false)
    renderGate()
    expect(screen.getByText('The app')).toBeInTheDocument()
  })
})

describe('Setup (#211)', () => {
  it('asks again, and Skip goes back to the list', async () => {
    const user = userEvent.setup()
    render(
      <ExploreProvider>
        <MemoryRouter initialEntries={['/setup']}>
          <Routes>
            <Route
              path="/setup"
              element={<Setup />}
            />
            <Route
              path="/"
              element={<p>The list</p>}
            />
          </Routes>
        </MemoryRouter>
      </ExploreProvider>
    )
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(screen.getByText('The list')).toBeInTheDocument()
  })
})
