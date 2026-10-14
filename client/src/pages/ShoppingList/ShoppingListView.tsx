import type { FC } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IngreIconBasket, IngreIconHouse } from '../../lib/icon/Icon'
import type { LibraryRecipe } from '../../types/library'
import { useShoppingList } from '../../utils/shopping/useShoppingList'
import { ServesPicker } from '../../components/ServesPicker'
import { LineGroups } from './LineGroups'

const VIEWS = [
  { value: 'home', label: 'At home', icon: <IngreIconHouse /> },
  { value: 'shop', label: 'At the shop', icon: <IngreIconBasket /> }
] satisfies { value: 'home' | 'shop'; label: string; icon: JSX.Element }[]

export const tapLabel = (n: number) => `Tap ${n} ${n === 1 ? 'item' : 'items'}`

export const ShoppingListView: FC<{ recipes: readonly LibraryRecipe[] }> = ({
  recipes
}) => {
  const list = useShoppingList(recipes)
  const [haveOpen, setHaveOpen] = useState(false)
  const atHome = list.view === 'home'

  if (recipes.length === 0)
    return (
      <p className="list-empty">
        Save a recipe or two and your shopping list appears here.{' '}
        <Link to="/">Browse recipes</Link>
      </p>
    )

  return (
    <>
      <div className="list-controls">
        <div
          className="segmented"
          role="radiogroup"
          aria-label="View"
        >
          {VIEWS.map(({ value, label, icon }) => (
            <label
              key={value}
              className="segmented__option"
            >
              <input
                type="radio"
                name="list-view"
                checked={list.view === value}
                onChange={() => list.setView(value)}
              />
              <span className="segmented__wide">
                {icon}
                {label}
              </span>
            </label>
          ))}
        </div>
        <ServesPicker
          people={list.people}
          onChange={list.setPeople}
        />
      </div>

      <h2 className="list-heading">
        {atHome ? 'Check your kitchen' : 'To buy'}
      </h2>
      {atHome && <p className="list-note">Tick what you already have</p>}
      {list.toBuy.length === 0 ? (
        <p className="list-empty">Nothing to buy. You have it all.</p>
      ) : (
        <LineGroups
          lines={list.toBuy}
          grouping={list.view}
          checkedIds={atHome ? new Set() : list.basketIds}
          struck={!atHome}
          onToggle={atHome ? list.toggleHave : list.toggleBasket}
          locationMode={atHome ? 'move' : 'chip'}
          onLocation={list.setLocation}
        />
      )}

      {list.alreadyHave.length > 0 && (
        <section className="list-have">
          <h2 className="list-heading">
            <button
              type="button"
              className="list-have__toggle"
              aria-expanded={haveOpen}
              onClick={() => setHaveOpen(!haveOpen)}
            >
              Already have ({list.alreadyHave.length})
            </button>
          </h2>
          {haveOpen && (
            <>
              {list.alreadyHave.some((l) => l.staple) && (
                <p className="list-note">
                  We assumed you have these. Untick anything you need to buy.
                </p>
              )}
              <LineGroups
                lines={list.alreadyHave}
                grouping={list.view}
                checkedIds={list.haveIds}
                struck={false}
                onToggle={list.toggleHave}
                locationMode={atHome ? 'move' : 'chip'}
                onLocation={list.setLocation}
              />
            </>
          )}
        </section>
      )}

      {list.toBuy.length > 0 && (
        <div className="list-tap">
          <Link
            to="/tapoff"
            className="btn btn-primary list-tap__button"
          >
            {tapLabel(list.toBuy.length)}
          </Link>
        </div>
      )}
    </>
  )
}
