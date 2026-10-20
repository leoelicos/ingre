import type { FC } from 'react'
import type { HomeLocation } from '../../types/library'
import type { LocationMode } from './ListRow'
import { SHOP_SECTIONS } from '../../utils/shopping/sections'
import type { ShopLine } from '../../utils/shopping/shoppingList'
import {
  HOME_GROUPS,
  groupBy,
  homeGroup
} from '../../utils/shopping/shoppingList'
import { ListRow } from './ListRow'
import type { TickState } from '../../utils/shopping/usePendingTicks'

export type Grouping = 'home' | 'shop'

interface Props {
  lines: readonly ShopLine[]
  grouping: Grouping
  ticks: TickState
  /** shop ticks strike through and sink; home ticks move the row away */
  struck: boolean
  locationMode: LocationMode
  onLocation: (id: string, location: HomeLocation) => void
  onQuantity: (lineId: string, quantity: number) => void
}

/** At the shop, moved (committed) ticks sink to the bottom of their section (stable order). */
export const ticksLast = (
  lines: readonly ShopLine[],
  struck: boolean,
  checkedIds: ReadonlySet<string>
): ShopLine[] =>
  struck
    ? [
        ...lines.filter((l) => !checkedIds.has(l.ingredientId)),
        ...lines.filter((l) => checkedIds.has(l.ingredientId))
      ]
    : [...lines]

/** Lines grouped by home location or shop section (Pantry keeps its aisle). */
export const LineGroups: FC<Props> = ({ lines, grouping, ...row }) => {
  const groups =
    grouping === 'home'
      ? groupBy(lines, homeGroup, HOME_GROUPS)
      : groupBy(lines, (l) => l.section, SHOP_SECTIONS)
  return (
    <>
      {groups.map(({ key, items }) => (
        <section
          key={key}
          className="mb-3 rounded-card bg-surface px-3 py-2 shadow-card last:mb-0"
          aria-label={key}
        >
          <h3 className="m-0 mb-1 text-[1rem] text-primary">{key}</h3>
          {groupBy(items, (l) =>
            grouping === 'shop' ? l.subsection ?? '' : ''
          ).map((sub) => (
            <div key={sub.key}>
              {sub.key !== '' && (
                <h4 className="mb-0 mt-2 text-[0.8rem] uppercase tracking-[0.04em] text-text-secondary">
                  {sub.key}
                </h4>
              )}
              <ul className="list-rows">
                {ticksLast(sub.items, row.struck, row.ticks.movedIds).map(
                  (line) => (
                    <ListRow
                      key={line.ingredientId}
                      line={line}
                      ticks={row.ticks}
                      struck={row.struck}
                      locationMode={row.locationMode}
                      onLocation={row.onLocation}
                      onQuantity={row.onQuantity}
                    />
                  )
                )}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </>
  )
}
