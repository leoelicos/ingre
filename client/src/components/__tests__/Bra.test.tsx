import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Bra } from '../Bra'

expect.extend(toHaveNoViolations)

class FakeViewport extends EventTarget {
  height = 800
}

describe('Bra (#210)', () => {
  afterEach(() =>
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: null
    })
  )

  it('is a named group of buttons fixed to the bottom-right corner', async () => {
    const { container } = render(
      <Bra>
        <button type="button">One</button>
      </Bra>
    )
    const group = screen.getByRole('group', { name: 'Quick actions' })
    expect(group).toHaveClass('fixed', 'bottom-4', 'right-4', 'touch-pan-y')
    expect(group).toContainElement(screen.getByRole('button', { name: 'One' }))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('steps aside while the keyboard is up, and returns after', () => {
    const viewport = new FakeViewport()
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport
    })
    window.innerHeight = 800
    render(
      <Bra>
        <button type="button">One</button>
      </Bra>
    )
    act(() => {
      viewport.height = 400
      viewport.dispatchEvent(new Event('resize'))
    })
    expect(screen.queryByRole('group', { name: 'Quick actions' })).toBeNull()
    act(() => {
      viewport.height = 800
      viewport.dispatchEvent(new Event('resize'))
    })
    expect(
      screen.getByRole('group', { name: 'Quick actions' })
    ).toBeInTheDocument()
  })
})
