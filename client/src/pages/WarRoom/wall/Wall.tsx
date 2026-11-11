/* The War room's tile grids and suggestion strip (t27u–t34u). */
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useT } from '../../../i18n'
import type { Tile } from '../../../utils/warroom/rank'
import type { WarRoomState } from '../../../utils/warroom/useWarRoom'
import { SEARCH_ID, WALL_ID } from './Controls'
import { TileView } from './Tiles'
import { useArrowNav } from './useArrowNav'

/** Thin aisle colour along a tile's top: the grouping, with no heading. */
export const STRIPE: Readonly<Record<string, string>> = {
  produce: 'border-t-badge-produce-ink',
  meat: 'border-t-badge-meat-ink',
  dairy: 'border-t-badge-dairy-ink',
  fruit: 'border-t-badge-fruit-ink',
  seafood: 'border-t-badge-seafood-ink',
  deli: 'border-t-badge-deli-ink',
  bakery: 'border-t-badge-bakery-ink',
  pantry: 'border-t-badge-pantry-ink',
  frozen: 'border-t-badge-frozen-ink',
  neutral: 'border-t-badge-neutral-ink'
}

const backToSearch = (): void => document.getElementById(SEARCH_ID)?.focus()

export interface GridProps {
  readonly room: WarRoomState
  readonly tiles: readonly Tile[]
  readonly size: number
  readonly scope: string
  readonly className: string
  readonly label: string
  /** recipes take two columns */
  readonly wideRecipes?: boolean
  /** the cell's classes: the aisle colour */
  readonly cellClass: (tile: Tile) => string
}

/** A labelled list of tiles with arrow keys between them (no heading: the label is for AT). */
export const TileGrid: FC<GridProps> = ({
  room,
  tiles,
  size,
  scope,
  className,
  label,
  wideRecipes = false,
  cellClass
}) => {
  const nav = useArrowNav(backToSearch)
  const ids = tiles.map(({ id }) => id)
  return (
    <ul
      id={WALL_ID}
      aria-label={label}
      data-wall
      className={`m-0 list-none p-0 ${className}`}
    >
      {tiles.map((tile) => (
        <TileCell
          key={tile.id}
          className={cellClass(tile)}
          room={room}
          tile={tile}
          size={size}
          scope={scope}
          wide={wideRecipes && tile.kind === 'recipe'}
          tabbable={nav.tabbable(tile.id, ids)}
          onFocusTile={nav.onFocusTile}
          onKeyDown={nav.onKeyDown}
        />
      ))}
    </ul>
  )
}

const TileCell: FC<{
  room: WarRoomState
  tile: Tile
  size: number
  scope: string
  wide: boolean
  tabbable: boolean
  className: string
  onFocusTile: (id: string) => void
  onKeyDown: ReturnType<typeof useArrowNav>['onKeyDown']
}> = ({ room, tile, ...rest }) => (
  <TileView
    {...rest}
    tile={tile}
    count={room.quantityOf(tile)}
    keepFocus={room.query !== ''}
    onTap={(picked) => {
      room.tap(picked)
      if (room.query !== '') room.setQuery('')
    }}
    onMinus={room.minus}
  />
)

/**
 * Suggestions in fixed slots: always `slots` cells, empty ones kept, so a new suggestion
 * lands in a slot and nothing beside it moves. They settle 600 ms after the last tap.
 */
export const SuggestionStrip: FC<{
  room: WarRoomState
  slots: number
  size: number
  className: string
}> = ({ room, slots, size, className }) => {
  const t = useT()
  const nav = useArrowNav(backToSearch)
  const cells = Array.from(
    { length: slots },
    (_, i) => room.suggestions[i] ?? null
  )
  const ids = cells.flatMap((s) => (s === null ? [] : [s.tile.id]))
  return (
    <ul
      aria-label={t('warRoomWall.suggestions')}
      data-wall
      className={`m-0 list-none p-0 ${className}`}
    >
      {cells.map((suggestion, i) =>
        suggestion === null ? (
          <li
            key={`empty-${i}`}
            aria-hidden="true"
            className="rounded-control border border-dashed border-border"
          />
        ) : (
          <TileView
            key={`${i}-${suggestion.tile.id}`}
            tile={suggestion.tile}
            count={room.quantityOf(suggestion.tile)}
            scope="suggest"
            size={size}
            suggestion={suggestion}
            keepFocus={room.query !== ''}
            tabbable={nav.tabbable(suggestion.tile.id, ids)}
            onTap={room.tap}
            onMinus={room.minus}
            onFocusTile={nav.onFocusTile}
            onKeyDown={nav.onKeyDown}
          />
        )
      )}
    </ul>
  )
}

/** The app header's height while it sticks, so the War room bar sticks right under it. */
export const useHeaderOffset = (): number => {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.ingre-navbar')
    if (header === null) return
    const measure = (): void =>
      setOffset(
        getComputedStyle(header).position === 'sticky' ? header.offsetHeight : 0
      )
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return offset
}
