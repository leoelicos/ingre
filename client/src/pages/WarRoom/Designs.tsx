/*
 * Three War room layouts on the same logic (t34u), picked with ?design=a|b|c on previews:
 * A poster grid, B checklist columns, C thumb belt. No visible headings in any of them.
 */
import type { FC, ReactNode } from 'react'
import { useT } from '../../i18n'
import type { Tile } from '../../utils/warroom/rank'
import type { WarRoomState } from '../../utils/warroom/useWarRoom'
import { KindToggle, LastStrip, SearchBar } from './wall/Controls'
import {
  BAND,
  STRIPE,
  SuggestionStrip,
  TileGrid,
  useHeaderOffset
} from './wall/Wall'

export type Design = 'a' | 'b' | 'c'

/** Tiles on show before a scroll, per layout, at 390 x 844 (the likely block). */
export const LIKELY: Readonly<Record<Design, number>> = { a: 24, b: 22, c: 20 }
export const SLOTS: Readonly<Record<Design, number>> = { a: 4, b: 4, c: 5 }

const Bar: FC<{
  room: WarRoomState
  children?: ReactNode
  bottom?: boolean
}> = ({ room, children, bottom = false }) => {
  const top = useHeaderOffset()
  return (
    <div
      style={bottom ? undefined : { top }}
      className={`${
        bottom
          ? 'fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-10 border-t border-border shadow-card'
          : 'sticky z-10'
      } -mx-gutter flex flex-col gap-1 bg-bg px-gutter pb-1 pt-1`}
    >
      {bottom && children}
      <SearchBar
        room={room}
        example={room.example}
      />
      <div className="flex items-center gap-1">
        <KindToggle room={room} />
        <LastStrip room={room} />
      </div>
      {!bottom && children}
    </div>
  )
}

const useLabels = () => {
  const t = useT()
  return {
    wall: t('warRoomWall.wall'),
    results: t('warRoomWall.resultsLabel'),
    recipes: t('warRoomWall.kindRecipes'),
    belt: t('warRoomWall.belt')
  }
}

const POSTER_GRID =
  'grid grid-cols-4 gap-1 auto-rows-[5.25rem] min-[600px]:grid-cols-6 min-[600px]:auto-rows-[6.5rem] md:grid-cols-8 lg:grid-cols-10'

const stripe = (tile: Tile): string =>
  `border-t-[3px] rounded-t-none ${STRIPE[tile.tone] ?? ''}`

/** A: a uniform poster grid; suggestions in a tinted strip under the bar; recipes as wide tiles. */
export const PosterGrid: FC<{ room: WarRoomState; tablet: boolean }> = ({
  room,
  tablet
}) => {
  const labels = useLabels()
  const size = tablet ? 64 : 48
  return (
    <>
      <Bar room={room} />
      {room.results === null ? (
        <>
          <SuggestionStrip
            room={room}
            slots={SLOTS.a * (tablet ? 2 : 1)}
            shape="poster"
            size={size - 8}
            className="grid grid-cols-4 gap-1 rounded-control bg-highlight p-1 auto-rows-[5.25rem] min-[600px]:grid-cols-6 md:grid-cols-8"
          />
          <TileGrid
            room={room}
            isWall
            tiles={[...room.wall.likely, ...room.wall.rest]}
            shape="poster"
            size={size}
            scope="wall"
            label={labels.wall}
            wideRecipes
            cellClass={stripe}
            className={`mt-1 ${POSTER_GRID}`}
          />
        </>
      ) : (
        <TileGrid
          room={room}
          isWall
          tiles={room.results}
          shape="poster"
          size={size}
          scope="results"
          label={labels.results}
          cellClass={stripe}
          className={POSTER_GRID}
        />
      )}
    </>
  )
}

const ROWS =
  'grid grid-cols-2 gap-x-2 gap-y-0.5 min-[600px]:grid-cols-3 lg:grid-cols-4'
const band = (tile: Tile): string =>
  `border-l-4 rounded-l-none ${BAND[tile.tone] ?? ''}`

/** B: printable-checklist rows (picture, name, tick box) in columns, aisle colour bands, recipes pinned. */
export const ChecklistColumns: FC<{ room: WarRoomState; tablet: boolean }> = ({
  room,
  tablet
}) => {
  const labels = useLabels()
  const size = tablet ? 40 : 34
  const recipes = room.wall.rest.filter((tile) => tile.kind === 'recipe')
  const ingredients = room.wall.rest.filter(
    (tile) => tile.kind === 'ingredient'
  )
  return (
    <>
      <Bar room={room}>
        {room.results === null && (
          <SuggestionStrip
            room={room}
            slots={SLOTS.b * (tablet ? 2 : 1)}
            shape="belt"
            size={34}
            className="grid grid-cols-4 gap-1 auto-rows-[3.75rem] min-[600px]:grid-cols-8"
          />
        )}
      </Bar>
      {room.results === null ? (
        <>
          {recipes.length > 0 && (
            <TileGrid
              room={room}
              tiles={recipes}
              shape="belt"
              size={36}
              scope="recipes"
              label={labels.recipes}
              className="-mx-gutter flex snap-x gap-1 overflow-x-auto px-gutter py-1 [&>li]:w-[4.75rem] [&>li]:shrink-0 [&>li]:snap-start [&>li]:h-[3.75rem]"
            />
          )}
          <TileGrid
            room={room}
            isWall
            tiles={[...room.wall.likely, ...ingredients]}
            shape="line"
            size={size}
            scope="wall"
            label={labels.wall}
            cellClass={band}
            className={ROWS}
          />
        </>
      ) : (
        <TileGrid
          room={room}
          isWall
          tiles={room.results}
          shape="line"
          size={size}
          scope="results"
          label={labels.results}
          cellClass={band}
          className={ROWS}
        />
      )}
    </>
  )
}

/** C: everything a thumb needs docked at the bottom (search, toggle, suggestion rail, a belt of the top 8); the wall above. */
export const ThumbBelt: FC<{ room: WarRoomState; tablet: boolean }> = ({
  room,
  tablet
}) => {
  const labels = useLabels()
  const size = tablet ? 64 : 48
  const belt = room.wall.likely.slice(0, 6)
  const beltIds = new Set(belt.map(({ id }) => id))
  const wall = [...room.wall.likely, ...room.wall.rest].filter(
    ({ id }) => !beltIds.has(id)
  )
  return (
    <>
      {room.results === null ? (
        <TileGrid
          room={room}
          isWall
          tiles={wall}
          shape="poster"
          size={size}
          scope="wall"
          label={labels.wall}
          wideRecipes
          cellClass={stripe}
          className={`pt-1 ${POSTER_GRID}`}
        />
      ) : (
        <TileGrid
          room={room}
          isWall
          tiles={room.results}
          shape="poster"
          size={size}
          scope="results"
          label={labels.results}
          cellClass={stripe}
          className={`pt-1 ${POSTER_GRID}`}
        />
      )}
      {/* room for the dock, so the last row is never under it */}
      <div
        aria-hidden="true"
        className="h-[12.5rem]"
      />
      <Bar
        room={room}
        bottom
      >
        <SuggestionStrip
          room={room}
          slots={SLOTS.c * (tablet ? 2 : 1)}
          shape="belt"
          size={28}
          className="grid grid-cols-5 gap-1 rounded-control bg-highlight p-0.5 auto-rows-[3.25rem] min-[600px]:grid-cols-10"
        />
        <TileGrid
          room={room}
          tiles={belt}
          shape="belt"
          size={34}
          scope="belt"
          label={labels.belt}
          className="grid grid-cols-6 gap-0.5 auto-rows-[3.5rem]"
        />
      </Bar>
    </>
  )
}
