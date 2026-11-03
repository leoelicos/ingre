import '@testing-library/jest-dom'
import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import {
  disconnected,
  fakeObserver,
  fire,
  margins,
  resetObserver
} from '../../../test/observer'
import { FAB_ROOT_MARGIN, Fab, fabMode, useFabMode } from '../Fab'
import type { FabMode } from '../Fab'

afterEach(resetObserver)

const section = () => {
  const el = document.createElement('section')
  el.id = 'ingredients'
  document.body.append(el)
  return el
}

describe('Feature: The FAB (#192)', () => {
  it('says pantry once the watched section is in its band, recipe otherwise', () => {
    expect(fabMode({ isIntersecting: true })).toBe('pantry')
    expect(fabMode({ isIntersecting: false })).toBe('recipe')
  })

  it('watches the section in the top tenth, follows it, and stops on unmount', () => {
    fakeObserver()
    const el = section()
    const { result, unmount } = renderHook(() => useFabMode('ingredients'))
    expect(margins.get('ingredients')).toBe(FAB_ROOT_MARGIN)
    expect(result.current).toBe('recipe')
    fire('ingredients', { isIntersecting: true })
    expect(result.current).toBe('pantry')
    fire('ingredients', { isIntersecting: false })
    expect(result.current).toBe('recipe')
    unmount()
    expect(disconnected).toEqual(['ingredients'])
    el.remove()
  })

  it('stays "+ Recipe" with no observer or no section', () => {
    expect(renderHook(() => useFabMode('ingredients')).result.current).toBe(
      'recipe'
    )
    fakeObserver()
    expect(renderHook(() => useFabMode('missing')).result.current).toBe(
      'recipe'
    )
    expect(margins.size).toBe(0)
  })

  it.each<[FabMode, string, string]>([
    ['recipe', 'Add a recipe', 'Recipe'],
    ['pantry', 'Add a pantry item', 'Pantry Item']
  ])(
    'in %s mode it is named %s, reads "+ %s" and says which it was pressed in',
    (mode, name, label) => {
      const pressed: FabMode[] = []
      render(
        <Fab
          mode={mode}
          onPress={(m) => pressed.push(m)}
        />
      )
      const fab = screen.getByRole('button', { name })
      expect(fab).toHaveTextContent(`+${label}`)
      expect(fab).toHaveAttribute('aria-haspopup', 'dialog')
      expect(fab).toHaveAttribute('data-mode', mode)
      expect(fab.className).toMatch(/env\(safe-area-inset-bottom\)/)
      fireEvent.click(fab)
      expect(pressed).toEqual([mode])
    }
  )
})
