/*
 * The War room's layout (t34u, approved): a poster grid. A sticky bar with the search field
 * and its big yellow mic on the bar's edge, the kind toggle and the last-add strip; under it a
 * tinted strip of suggestions, then a uniform grid of big pictures with recipes as wide tiles.
 * No visible headings.
 */
import type { FC } from 'react'
import { useT } from '../../i18n'
import type { Tile } from '../../utils/warroom/rank'
import type { WarRoomState } from '../../utils/warroom/useWarRoom'
import { KindToggle, LastStrip, SearchBar } from './wall/Controls'
import { STRIPE, SuggestionStrip, TileGrid, useHeaderOffset } from './wall/Wall'

/** Tiles on show before a scroll at 390 x 844 (the likely block), doubled on a tablet. */
export const LIKELY = 24
/** Suggestions in the strip under the bar, doubled on a tablet. */
export const SLOTS = 4

const Bar: FC<{ room: WarRoomState }> = ({ room }) => {
  const top = useHeaderOffset()
  return (
    <div
      style={{ top }}
      className="sticky z-10 -mx-gutter flex flex-col gap-1 bg-bg px-gutter pb-1 pt-1"
    >
      <SearchBar
        room={room}
        example={room.example}
      />
      <div className="flex items-center gap-1">
        <KindToggle room={room} />
        <LastStrip room={room} />
      </div>
    </div>
  )
}

const POSTER_GRID =
  'grid grid-cols-4 gap-1 auto-rows-[5.25rem] min-[600px]:grid-cols-6 min-[600px]:auto-rows-[6.5rem] md:grid-cols-8 lg:grid-cols-10'

/** The aisle colour along a poster's top. */
export const stripe = (tile: Tile): string =>
  `border-t-[3px] rounded-t-none ${STRIPE[tile.tone] ?? ''}`

/** A uniform poster grid; suggestions in a tinted strip under the bar; recipes as wide tiles. */
export const PosterGrid: FC<{ room: WarRoomState; tablet: boolean }> = ({
  room,
  tablet
}) => {
  const t = useT()
  const size = tablet ? 64 : 48
  return (
    <>
      <Bar room={room} />
      {room.results === null ? (
        <>
          <SuggestionStrip
            room={room}
            slots={SLOTS * (tablet ? 2 : 1)}
            size={size - 8}
            className="grid grid-cols-4 gap-1 rounded-control bg-highlight p-1 auto-rows-[5.25rem] min-[600px]:grid-cols-6 md:grid-cols-8"
          />
          <TileGrid
            room={room}
            tiles={[...room.wall.likely, ...room.wall.rest]}
            size={size}
            scope="wall"
            label={t('warRoomWall.wall')}
            wideRecipes
            cellClass={stripe}
            className={`mt-1 ${POSTER_GRID}`}
          />
        </>
      ) : (
        <TileGrid
          room={room}
          tiles={room.results}
          size={size}
          scope="results"
          label={t('warRoomWall.resultsLabel')}
          cellClass={stripe}
          className={POSTER_GRID}
        />
      )}
    </>
  )
}
