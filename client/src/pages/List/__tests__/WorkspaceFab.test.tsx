import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import { fabMode, latestIntersecting, WorkspaceFab } from '../WorkspaceFab'

describe('fab mode (#192)', () => {
  it('is a recipe near the top and a pantry item once Ingredients is in view', () => {
    expect(fabMode(false)).toBe('recipe')
    expect(fabMode(true)).toBe('pantry')
    expect(latestIntersecting([])).toBeNull()
    expect(latestIntersecting([{ isIntersecting: false }])).toBe(false)
    expect(
      latestIntersecting([{ isIntersecting: false }, { isIntersecting: true }])
    ).toBe(true)
  })
})

describe('WorkspaceFab', () => {
  const original = window.IntersectionObserver

  afterEach(() => {
    window.IntersectionObserver = original
    document.body.replaceChildren()
  })

  it('stays "+ Recipe" without an observer or without the section', () => {
    Reflect.deleteProperty(window, 'IntersectionObserver')
    const { unmount } = render(
      <WorkspaceFab
        watchId="missing"
        onRecipe={() => undefined}
        onPantry={() => undefined}
      />
    )
    expect(screen.getByRole('button', { name: '+ Recipe' })).toBeInTheDocument()
    unmount()
    window.IntersectionObserver = original
    render(
      <WorkspaceFab
        watchId="missing"
        onRecipe={() => undefined}
        onPantry={() => undefined}
      />
    )
    expect(screen.getByRole('button', { name: '+ Recipe' })).toBeInTheDocument()
  })

  it('follows the observer and presses the action for that mode', () => {
    const calls: IntersectionObserverCallback[] = []
    const disconnected: string[] = []
    class FakeObserver {
      readonly root = null
      readonly rootMargin = ''
      readonly scrollMargin = ''
      readonly thresholds = []
      constructor(callback: IntersectionObserverCallback) {
        calls.push(callback)
      }
      observe() {}
      unobserve() {}
      disconnect() {
        disconnected.push('yes')
      }
      takeRecords() {
        return []
      }
    }
    window.IntersectionObserver = FakeObserver
    document.body.innerHTML = '<section id="ingredients"></section>'
    let recipes = 0
    let pantries = 0
    const view = render(
      <WorkspaceFab
        watchId="ingredients"
        onRecipe={() => {
          recipes += 1
        }}
        onPantry={() => {
          pantries += 1
        }}
      />
    )
    const callback = calls[0]
    if (callback === undefined) throw new Error('no observer')
    act(() => callback([], {} as IntersectionObserver))
    expect(screen.getByRole('button', { name: '+ Recipe' })).toBeInTheDocument()
    act(() =>
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    )
    screen.getByRole('button', { name: '+ Pantry Item' }).click()
    expect(pantries).toBe(1)
    act(() =>
      callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    )
    screen.getByRole('button', { name: '+ Recipe' }).click()
    expect(recipes).toBe(1)
    view.unmount()
    expect(disconnected).toEqual(['yes'])
  })
})
