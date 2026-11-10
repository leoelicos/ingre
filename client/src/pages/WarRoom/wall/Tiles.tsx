/*
 * One tile, three shapes (t27u–t34u): a poster (big picture over a short name), a checklist
 * row (picture, name, tick box) and a belt chip. Tap adds one more; the tiny minus takes one
 * off. Counts and ticks sit on the picture's corner so nothing around the tile moves.
 */
import type { FC, KeyboardEvent } from 'react'
import { Button } from 'react-aria-components'
import { useT } from '../../../i18n'
import { capitaliseFirst } from '../../../utils/capitaliseFirst'
import type { Tile } from '../../../utils/warroom/rank'
import type { Suggestion } from '../../../utils/warroom/suggest'
import { TilePicture, toneClass } from './TilePicture'

export type TileShape = 'poster' | 'line' | 'belt'

export const tileDomId = (scope: string, tile: Tile): string =>
  `wr-${scope}-${tile.id}`

const useNames = () => {
  const t = useT()
  return {
    add: (tile: Tile, count: number, reason: string): string => {
      const name = tile.name
      const base =
        tile.kind === 'recipe'
          ? count > 0
            ? t('warRoomWall.recipeOn', { name })
            : t('warRoomWall.recipe', { name })
          : count > 0
          ? t('warRoomWall.addCount', { name, count })
          : t('warRoomWall.add', { name })
      return reason === '' ? base : `${base}, ${reason}`
    },
    minus: (tile: Tile): string =>
      tile.kind === 'recipe'
        ? t('warRoomWall.minusRecipe', { name: tile.name })
        : t('warRoomWall.minus', { name: tile.name })
  }
}

/** The short reason under a suggestion: "with mince", "2 more". */
export const useReason = () => {
  const t = useT()
  return (suggestion: Suggestion | null): string => {
    if (suggestion === null) return ''
    const { reason } = suggestion
    switch (reason.type) {
      case 'with':
        return t('warRoomWall.with', { name: reason.name })
      case 'more':
        return t('warRoomWall.moreToBuy', { count: reason.count })
      case 'usual':
        return t('warRoomWall.usual')
      case 'try':
        return t('warRoomWall.try')
    }
  }
}

const Badge: FC<{ count: number; recipe: boolean }> = ({ count, recipe }) =>
  count === 0 ? null : (
    <span
      aria-hidden="true"
      className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-on-primary shadow-chip"
    >
      {count === 1 || recipe ? '✓' : count}
    </span>
  )

export interface TileProps {
  readonly tile: Tile
  readonly count: number
  readonly shape: TileShape
  readonly scope: string
  readonly size: number
  readonly suggestion?: Suggestion | null
  /** keep focus in the search field while it has text (the keyboard stays up) */
  readonly keepFocus: boolean
  readonly tabbable: boolean
  readonly onTap: (tile: Tile) => void
  readonly onMinus: (tile: Tile) => void
  readonly onFocusTile: (id: string) => void
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  /** a recipe spans two columns in the poster grid */
  readonly wide?: boolean
  /** extra classes on the cell: the aisle colour */
  readonly className?: string
}

const SHAPE: Readonly<Record<TileShape, string>> = {
  poster:
    'h-full w-full flex-col items-center justify-start gap-0.5 rounded-control px-0.5 pb-1 pt-1.5 text-center',
  line: 'h-11 w-full flex-row items-center gap-2 rounded-control pl-1.5 pr-8 text-left',
  belt: 'h-full w-full flex-col items-center justify-center gap-0 rounded-control px-0.5 py-1 text-center'
}

const LABEL: Readonly<Record<TileShape, string>> = {
  poster: 'line-clamp-2 text-[11px] font-semibold leading-[13px]',
  line: 'min-w-0 flex-1 truncate text-sm font-semibold',
  belt: 'w-full truncate text-[10px] font-semibold leading-3'
}

export const TileView: FC<TileProps> = ({
  tile,
  count,
  shape,
  scope,
  size,
  suggestion = null,
  keepFocus,
  tabbable,
  onTap,
  onMinus,
  onFocusTile,
  onKeyDown,
  wide = false,
  className = ''
}) => {
  const names = useNames()
  const reasonOf = useReason()
  const reason = reasonOf(suggestion)
  const on = count > 0
  return (
    <li
      className={`relative min-h-[44px] list-none ${
        wide ? 'col-span-2' : ''
      } ${className}`}
      data-tile-cell
    >
      <Button
        id={tileDomId(scope, tile)}
        data-tile
        data-tile-id={tile.id}
        aria-label={names.add(tile, count, reason)}
        preventFocusOnPress={keepFocus}
        excludeFromTabOrder={!tabbable}
        onPress={() => onTap(tile)}
        onFocus={() => onFocusTile(tile.id)}
        onKeyDown={(event) => {
          if (['-', 'Delete', 'Backspace'].includes(event.key)) {
            event.preventDefault()
            onMinus(tile)
          } else onKeyDown(event)
        }}
        className={`flex touch-manipulation select-none text-text outline-none data-[focus-visible]:focus-ring data-[pressed]:scale-[0.97] motion-reduce:data-[pressed]:scale-100 ${
          SHAPE[shape]
        } ${
          on ? 'bg-chip-active ring-2 ring-inset ring-primary' : 'bg-surface'
        } ${
          tile.kind === 'recipe'
            ? 'border border-dashed border-text-secondary'
            : ''
        }`}
      >
        <span className="relative inline-flex shrink-0">
          <TilePicture
            tile={tile}
            size={size}
          />
          {shape !== 'line' && (
            <Badge
              count={count}
              recipe={tile.kind === 'recipe'}
            />
          )}
        </span>
        <span className={LABEL[shape]}>{capitaliseFirst(tile.name)}</span>
        {/* a space between name and reason, so the text reads as the name does (axe) */}
        {reason !== '' && ' '}
        {reason !== '' && (
          <span
            className={`w-full truncate text-[10px] leading-3 ${toneClass(
              tile.tone
            )} rounded-pill px-1`}
          >
            {reason}
          </span>
        )}
        {shape === 'line' && (
          <span
            aria-hidden="true"
            className={`absolute right-2 top-1/2 inline-flex h-5 min-w-[1.25rem] -translate-y-1/2 items-center justify-center rounded border-2 px-0.5 text-[11px] font-bold ${
              on
                ? 'border-primary bg-primary text-on-primary'
                : 'border-text-secondary'
            }`}
          >
            {on ? (count > 1 && tile.kind === 'ingredient' ? count : '✓') : ''}
          </span>
        )}
      </Button>
      {on && shape !== 'belt' && (
        <Button
          aria-label={names.minus(tile)}
          excludeFromTabOrder
          preventFocusOnPress={keepFocus}
          onPress={() => onMinus(tile)}
          className={`absolute inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-sm font-bold leading-none text-text shadow-chip data-[focus-visible]:focus-ring ${
            shape === 'line' ? 'right-9 top-2.5' : 'left-0.5 top-0.5'
          }`}
        >
          <span aria-hidden="true">−</span>
        </Button>
      )}
    </li>
  )
}
