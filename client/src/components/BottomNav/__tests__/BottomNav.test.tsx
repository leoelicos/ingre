import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import {
  installViewport,
  removeViewport,
  setKeyboard
} from '../../../test/keyboard'
import { BottomNav } from '../BottomNav'

const Where = () => {
  const { pathname, hash } = useLocation()
  return <output aria-label="where">{`${pathname}${hash}`}</output>
}

const renderNav = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
      <Where />
    </MemoryRouter>
  )
const nav = () => within(screen.getByRole('navigation', { name: 'Main' }))

describe('bottom navigation (#227)', () => {
  it('has exactly four tabs: Explore, Inventory, Cook, Profile', () => {
    renderNav('/')
    expect(
      nav()
        .getAllByRole('link')
        .map((l) => l.textContent)
    ).toEqual(['Explore', 'Inventory', 'Cook', 'Profile'])
  })

  it('is fixed to the bottom and leaves room under the page', () => {
    const { container } = renderNav('/')
    expect(screen.getByRole('navigation')).toHaveClass('fixed', 'bottom-0')
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      'h-[calc(4.5rem+env(safe-area-inset-bottom))]'
    )
  })

  it('every tab is at least 44px tall', () => {
    renderNav('/')
    nav()
      .getAllByRole('link')
      .forEach((link) => expect(link).toHaveClass('min-h-[56px]'))
  })

  it.each([
    ['/', 'Explore'],
    ['/#explore', 'Explore'],
    ['/#inventory', 'Inventory'],
    ['/#cook', 'Cook'],
    ['/profile', 'Profile']
  ])('at %s the %s tab is current, and only it', (path, name) => {
    renderNav(path)
    const current = nav()
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page')
    expect(current.map((l) => l.textContent)).toEqual([name])
  })

  it('has no current tab on Log in', () => {
    renderNav('/login')
    expect(
      nav()
        .getAllByRole('link')
        .filter((link) => link.hasAttribute('aria-current'))
    ).toEqual([])
  })

  it('takes you to each tab, and the bar stays', async () => {
    const user = userEvent.setup()
    renderNav('/')
    await user.click(nav().getByRole('link', { name: 'Cook' }))
    expect(screen.getByLabelText('where')).toHaveTextContent('/#cook')
    await user.click(nav().getByRole('link', { name: 'Profile' }))
    expect(screen.getByLabelText('where')).toHaveTextContent('/profile')
    expect(nav().getAllByRole('link')).toHaveLength(4)
  })

  it('steps aside while the keyboard is up, and comes back (#228)', () => {
    installViewport()
    renderNav('/')
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeVisible()
    setKeyboard(true)
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
    setKeyboard(false)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeVisible()
    removeViewport()
  })
})
