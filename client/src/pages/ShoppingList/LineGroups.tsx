import type { FC } from 'react'
import type { HomeLocation } from '../../types/library'
import type { LocationMode } from './ListRow'
import { HOME_LOCATIONS } from '../../utils/library/parseLibrary'
import { SHOP_SECTIONS } from '../../utils/shopping/sections'
import type { ShopLine } from '../../utils/shopping/shoppingList'
import { groupBy } from '../../utils/shopping/shoppingList'
import { ListRow } from './ListRow'

export type Grouping = 'home' | 'shop'

interface Props {
  lines: readonly ShopLine[]
  grouping: Grouping
  checkedIds: ReadonlySet<string>
  /** shop ticks strike through in place; home ticks move the row away */
  struck: boolean
  onToggle: (ingredientId: string) => void
  locationMode: LocationMode
  onLocation: (id: string, location: HomeLocation) => void
  onQuantity: (lineId: string, quantity: number) => void
}

/** Lines grouped by home location or shop section (Pantry keeps its aisle). */
export const LineGroups: FC<Props> = ({ lines, grouping, ...row }) => {
  const groups =
    grouping === 'home'
      ? groupBy(lines, (l) => l.location, HOME_LOCATIONS)
      : groupBy(lines, (l) => l.section, SHOP_SECTIONS)
  return (
    <>
      {groups.map(({ key, items }) => (
        <section
          key={key}
          className="list-group"
          aria-label={key}
        >
          <h3 className="list-group__title">{key}</h3>
          {groupBy(items, (l) =>
            grouping === 'shop' ? l.subsection ?? '' : ''
          ).map((sub) => (
            <div key={sub.key}>
              {sub.key !== '' && <h4 className="list-group__sub">{sub.key}</h4>}
              <ul className="list-rows">
                {sub.items.map((line) => (
                  <ListRow
                    key={line.ingredientId}
                    line={line}
                    checked={row.checkedIds.has(line.ingredientId)}
                    struck={row.struck}
                    onToggle={row.onToggle}
                    locationMode={row.locationMode}
                    onLocation={row.onLocation}
                    onQuantity={row.onQuantity}
                  />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </>
  )
}
