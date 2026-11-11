import '@testing-library/jest-dom'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuthContext } from '../../../utils/auth/AuthContext'
import { Header } from '../../Header'
import { logIn } from '../../../test/providers'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import { accountLabel, AccountMenu } from '../AccountMenu'
import { markFirstEndToEnd } from '../../../utils/tier/upsell'
import {
  PLANS_PATH,
  SAVED_PATH,
  SETUP_PATH,
  accountItems,
  actionsFor
} from '../accountItems'

addFontAwesome()

/** Shows where the app is and the router state it was sent with. */
const Where = () => {
  const { pathname, search, state } = useLocation()
  return (
    <p data-testid="where">{`${pathname}${search} ${JSON.stringify(state)}`}</p>
  )
}

const renderMenu = (loggedIn: boolean) =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={['/recipe/dahl?x=1']}>
        <AuthProvider>
          <AccountMenu loggedIn={loggedIn} />
          <Routes>
            <Route
              path="*"
              element={<Where />}
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

const trigger = () => screen.getByRole('button', { name: accountLabel() })
const itemNames = () =>
  screen.getAllByRole('menuitem').map((item) => item.textContent)
const where = () => screen.getByTestId('where').textContent

describe('AccountMenu (#164)', () => {
  beforeEach(() => localStorage.clear())

  it('is a labelled menu button, announced collapsed then expanded', async () => {
    const user = userEvent.setup()
    renderMenu(false)
    const icon = trigger()
    expect(icon).toHaveAttribute('aria-haspopup', 'true')
    expect(icon).toHaveAttribute('aria-expanded', 'false')
    expect(icon.className).toContain('data-[focus-visible]:focus-ring')
    await user.click(icon)
    expect(icon).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('menu', { name: accountLabel() })
    ).toBeInTheDocument()
  })

  it('signed out: Log in, Sign up and Set-up', async () => {
    const user = userEvent.setup()
    renderMenu(false)
    await user.click(trigger())
    expect(itemNames()).toEqual(['Log in', 'Sign up', 'Set-up'])
  })

  it('signed in: Saved, Set-up and Log out', async () => {
    const user = userEvent.setup()
    renderMenu(true)
    await user.click(trigger())
    expect(itemNames()).toEqual(['Saved', 'Set-up', 'Log out'])
  })

  it('arrow keys move between items; Escape closes and returns focus to the icon', async () => {
    const user = userEvent.setup()
    renderMenu(false)
    const icon = trigger()
    icon.focus()
    await user.keyboard('{Enter}')
    const [login, signup] = screen.getAllByRole('menuitem')
    expect(login).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(signup).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(login).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(icon).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => expect(icon).toHaveFocus())
  })

  it('Log in and Sign up go to their pages and come back to where you were', async () => {
    const user = userEvent.setup()
    renderMenu(false)
    await user.click(trigger())
    await user.click(screen.getByRole('menuitem', { name: 'Log in' }))
    expect(where()).toBe('/login {"from":"/recipe/dahl?x=1"}')
    await user.click(trigger())
    await user.click(screen.getByRole('menuitem', { name: 'Sign up' }))
    expect(where()).toBe('/signup {"from":"/login"}')
  })

  it('Saved opens Pick with the Saved filter; Log out signs out', async () => {
    const user = userEvent.setup()
    logIn(false)
    renderMenu(true)
    await user.click(trigger())
    await user.click(screen.getByRole('menuitem', { name: 'Saved' }))
    expect(where()).toBe(`${SAVED_PATH} null`)
    await user.click(trigger())
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }))
    expect(localStorage.getItem('id_token')).toBeNull()
  })

  it('Set-up opens the three questions again (#211)', async () => {
    const user = userEvent.setup()
    renderMenu(false)
    await user.click(trigger())
    await user.click(screen.getByRole('menuitem', { name: 'Set-up' }))
    expect(where()).toBe(`${SETUP_PATH} null`)
  })

  it('with the tiers flag on, Plans appears after the first end-to-end, before Log out, and opens Plans (#208)', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/?flags=tiers')
    renderMenu(true)
    await user.click(trigger())
    expect(itemNames()).toEqual(['Saved', 'Set-up', 'Log out'])
    await user.keyboard('{Escape}')
    act(() => markFirstEndToEnd())
    await user.click(trigger())
    expect(itemNames()).toEqual(['Saved', 'Set-up', 'Plans', 'Log out'])
    await user.click(screen.getByRole('menuitem', { name: 'Plans' }))
    expect(where()).toBe(`${PLANS_PATH} null`)
    window.history.pushState({}, '', '/?flags=')
    window.history.pushState({}, '', '/')
  })

  it('without the tiers flag, the first end-to-end shows no Plans (#208)', async () => {
    const user = userEvent.setup()
    markFirstEndToEnd()
    renderMenu(false)
    await user.click(trigger())
    expect(itemNames()).toEqual(['Log in', 'Sign up', 'Set-up'])
  })

  it('maps menu keys to actions; anything else is no action', () => {
    expect(accountItems(true, true).map((i) => i.id)).toEqual([
      'saved',
      'setup',
      'plans',
      'logout'
    ])
    expect(accountItems(false, true).map((i) => i.id)).toEqual([
      'login',
      'signup',
      'setup',
      'plans'
    ])
    expect(actionsFor('plans')).toEqual(['plans'])
    expect(accountItems(false).map((i) => i.id)).toEqual([
      'login',
      'signup',
      'setup'
    ])
    expect(actionsFor('saved')).toEqual(['saved'])
    expect(actionsFor('setup')).toEqual(['setup'])
    expect(actionsFor('nope')).toEqual([])
    expect(actionsFor(3)).toEqual([])
  })

  it('after logging in, the header account menu shows Saved, which opens the Saved filter', async () => {
    const user = userEvent.setup()
    const payload = btoa(
      JSON.stringify({
        data: { firstName: 'Ada', email: 'a@b.c', _id: '1', pro: false },
        exp: Date.now() / 1000 + 3600
      })
    )
    const token = `e30.${payload}.sig`
    const LogIn = () => {
      const [, dispatch] = useAuthContext()
      return (
        <button
          type="button"
          onClick={() => dispatch({ type: 'LOGIN', data: token })}
        >
          Pretend login
        </button>
      )
    }
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <Header />
            <LogIn />
            <Routes>
              <Route
                path="*"
                element={<Where />}
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    await user.click(trigger())
    expect(itemNames()).toEqual(['Log in', 'Sign up', 'Set-up'])
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Pretend login' }))
    await user.click(trigger())
    expect(itemNames()).toEqual(['Saved', 'Set-up', 'Log out'])
    await user.click(screen.getByRole('menuitem', { name: 'Saved' }))
    expect(where()).toBe(`${SAVED_PATH} null`)
  })
})
