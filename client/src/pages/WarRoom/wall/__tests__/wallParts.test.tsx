import '@testing-library/jest-dom'
import { act, render, renderHook, screen } from '@testing-library/react'
import type { KeyboardEvent } from 'react'
import { sectionColours } from '../../../../utils/library/recipeLibrary'
import type { Tile } from '../../../../utils/warroom/rank'
import { ALL_TILES, ingredientTile } from '../../../../utils/warroom/rank'
import type { Suggestion } from '../../../../utils/warroom/suggest'
import type { WarRoomState } from '../../../../utils/warroom/useWarRoom'
import { stripe } from '../../PosterGrid'
import { toneClass } from '../TilePicture'
import { useReason } from '../Tiles'
import { target, useArrowNav } from '../useArrowNav'
import { SuggestionStrip } from '../Wall'

/* The poster grid's small parts, one at a time (t34u). */

const banana = ALL_TILES.find((tile) => tile.id === 'banana') as Tile

describe('colours', () => {
  it('an aisle with no colour gets no stripe and the neutral badge', () => {
    const odd = { ...banana, tone: 'zzz' }
    expect(stripe(odd)).toBe('border-t-[3px] rounded-t-none ')
    expect(toneClass('zzz')).toBe('bg-badge-neutral text-badge-neutral-ink')
  })

  it('a section with no colour in the data is neutral', () => {
    if (banana.kind !== 'ingredient') throw new Error('banana is an ingredient')
    const colours = sectionColours as Record<string, string>
    const saved = colours[banana.section]
    delete colours[banana.section]
    expect(ingredientTile(banana.item).tone).toBe('neutral')
    if (saved !== undefined) colours[banana.section] = saved
  })
})

describe('useReason', () => {
  it('says why for every kind of suggestion', () => {
    const { result } = renderHook(() => useReason())
    const reason = (r: Suggestion['reason']) =>
      result.current({ tile: banana, reason: r })
    expect(reason({ type: 'with', name: 'mince' })).toBe('with mince')
    expect(reason({ type: 'more', count: 2 })).toMatch(/2/)
    expect(reason({ type: 'usual' })).not.toBe('')
    expect(reason({ type: 'try' })).not.toBe('')
    expect(result.current(null)).toBe('')
  })
})

describe('target', () => {
  const tileAt = (x: number, y: number): HTMLElement => {
    const el = document.createElement('button')
    el.getBoundingClientRect = () =>
      ({ left: x, top: y, width: 10, height: 10 } as DOMRect)
    return el
  }
  /* two rows of two, and a third row of one */
  const a = tileAt(0, 0)
  const b = tileAt(20, 0)
  const c = tileAt(0, 20)
  const d = tileAt(20, 20)
  const e = tileAt(18, 40)
  const tiles = [a, b, c, d, e]

  it('moves along, to the ends, and to the nearest tile in the row above or below', () => {
    expect(target('ArrowRight', a, tiles)).toBe(b)
    expect(target('ArrowRight', e, tiles)).toBeNull()
    expect(target('ArrowLeft', b, tiles)).toBe(a)
    expect(target('ArrowLeft', a, tiles)).toBeNull()
    expect(target('Home', d, tiles)).toBe(a)
    expect(target('End', a, tiles)).toBe(e)
    expect(target('Home', a, [])).toBeNull()
    expect(target('End', a, [])).toBeNull()
    expect(target('ArrowDown', b, tiles)).toBe(d)
    expect(target('ArrowDown', a, tiles)).toBe(c)
    expect(target('ArrowDown', c, tiles)).toBe(e)
    expect(target('ArrowUp', e, tiles)).toBe(d)
    expect(target('ArrowUp', a, tiles)).toBeNull()
    expect(target('ArrowDown', e, tiles)).toBeNull()
    expect(target('x', a, tiles)).toBeNull()
  })
})

describe('useArrowNav', () => {
  const press = (key: string, currentTarget: HTMLElement) => {
    const event = {
      key,
      currentTarget,
      preventDefault: jest.fn()
    } as unknown as KeyboardEvent<HTMLElement>
    return event
  }

  it('outside a wall, a key does its usual thing, and ArrowUp leaves the top', () => {
    const leave = jest.fn()
    const { result } = renderHook(() => useArrowNav(leave))
    const loose = document.createElement('button')
    const right = press('ArrowRight', loose)
    result.current.onKeyDown(right)
    expect(right.preventDefault).not.toHaveBeenCalled()
    result.current.onKeyDown(press('ArrowUp', loose))
    expect(leave).toHaveBeenCalled()
  })

  it('keeps the last focused tile in the tab order while it is shown', () => {
    const { result } = renderHook(() => useArrowNav(jest.fn()))
    expect(result.current.tabbable('a', ['a', 'b'])).toBe(true)
    act(() => result.current.onFocusTile('b'))
    expect(result.current.tabbable('b', ['a', 'b'])).toBe(true)
    expect(result.current.tabbable('a', ['a', 'b'])).toBe(false)
    expect(result.current.tabbable('a', ['a'])).toBe(true)
  })
})

describe('SuggestionStrip', () => {
  it('keeps empty slots, so a new suggestion never moves the others', () => {
    const room = { suggestions: [] } as unknown as WarRoomState
    render(
      <SuggestionStrip
        room={room}
        slots={3}
        size={40}
        className=""
      />
    )
    const strip = screen.getByRole('list', { name: 'Suggestions' })
    expect(strip.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(3)
  })
})
