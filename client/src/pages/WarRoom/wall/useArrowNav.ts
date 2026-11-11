/*
 * Arrow keys through a wall of tiles (t27u): left and right go to the next tile, up and down
 * to the nearest tile in the row above or below, Home and End to the ends. One tile in the
 * wall is in the tab order at a time (roving tabindex), so Tab jumps past the wall.
 */
import type { KeyboardEvent } from 'react'
import { useState } from 'react'

const tilesIn = (from: HTMLElement): HTMLElement[] => {
  const wall = from.closest<HTMLElement>('[data-wall]')
  return wall === null
    ? []
    : [...wall.querySelectorAll<HTMLElement>('[data-tile]')]
}

const centre = (el: HTMLElement) => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }
}

/** The tile a key moves to from `current`, or null to let the key do its usual thing. */
export const target = (
  key: string,
  current: HTMLElement,
  tiles: readonly HTMLElement[]
): HTMLElement | null => {
  const at = tiles.indexOf(current)
  if (key === 'ArrowRight') return tiles[at + 1] ?? null
  if (key === 'ArrowLeft') return tiles[at - 1] ?? null
  if (key === 'Home') return tiles[0] ?? null
  if (key === 'End') return tiles[tiles.length - 1] ?? null
  if (key !== 'ArrowDown' && key !== 'ArrowUp') return null
  const here = centre(current)
  const down = key === 'ArrowDown'
  const candidates = tiles
    .map((el) => ({ el, c: centre(el) }))
    .filter(({ c }) =>
      down ? c.y > here.y + here.h / 2 : c.y < here.y - here.h / 2
    )
  if (candidates.length === 0) return null
  const rowY = down
    ? Math.min(...candidates.map(({ c }) => c.y))
    : Math.max(...candidates.map(({ c }) => c.y))
  const across = ({ c }: { c: { x: number } }): number => Math.abs(c.x - here.x)
  return candidates
    .filter(({ c }) => Math.abs(c.y - rowY) < here.h / 2)
    .reduce((best, next) => (across(next) < across(best) ? next : best)).el
}

export const useArrowNav = (onLeaveTop: () => void) => {
  const [active, setActive] = useState<string | null>(null)
  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const current = event.currentTarget
    const next = target(event.key, current, tilesIn(current))
    if (next === null) {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        onLeaveTop()
      }
      return
    }
    event.preventDefault()
    next.focus()
    next.scrollIntoView({ block: 'nearest' })
  }
  return {
    active,
    onFocusTile: setActive,
    onKeyDown,
    /** the tile in the tab order: the last focused one still shown, else the first */
    tabbable: (id: string, ids: readonly string[]): boolean =>
      active !== null && ids.includes(active) ? id === active : id === ids[0]
  }
}
