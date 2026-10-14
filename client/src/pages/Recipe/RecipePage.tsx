import type { FC } from 'react'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ServesPicker } from '../../components/ServesPicker'
import { SaveButton } from '../../components/Widgets/RecipeCard/components/SaveButton'
import {
  heroIcon,
  splitTitle,
  tintFor
} from '../../components/Widgets/RecipeCard/recipeCardHelpers'
import { Icon, IngreIconBack } from '../../lib/icon/Icon'
import type { LibraryRecipe } from '../../types/library'
import { changeTitle } from '../../utils/changeTitle'
import { catalogue, library } from '../../utils/library/recipeLibrary'
import {
  assumedNames,
  buildShoppingList,
  buyAmount,
  displayName,
  usesLabel
} from '../../utils/shopping/shoppingList'
import { usePeople } from '../../utils/storage/people'
import { usePickedIds } from '../../utils/storage/shoppingState'
import '../../styles/segmented.css'
import '../ShoppingList/shoppingList.css'
import '../../components/Widgets/RecipeCard/recipeCard.css'
import './recipe.css'

/** "Indian · dinner": tags only, no time. */
export const recipeMeta = (tags: readonly string[]): string => tags.join(' · ')

export const findRecipe = (id: string | undefined): LibraryRecipe | null =>
  library.find((r) => r.id === id) ?? null

/** Back to where the user came from, or home when the page was opened directly. */
const BackButton: FC = () => {
  const navigate = useNavigate()
  const { key } = useLocation()
  return (
    <button
      type="button"
      className="recipe-panel__back"
      aria-label="Back"
      onClick={() => (key === 'default' ? navigate('/') : navigate(-1))}
    >
      <IngreIconBack />
    </button>
  )
}

const AddToList: FC<{ id: string; title: string }> = ({ id, title }) => {
  const [pickedIds, togglePicked] = usePickedIds()
  return pickedIds.has(id) ? (
    <Link
      to="/ingredients"
      className="btn btn-primary recipe-add"
    >
      ✓ Added · View list
    </Link>
  ) : (
    <button
      type="button"
      className="btn btn-primary recipe-add"
      onClick={() => togglePicked(id)}
    >
      + Add to list<span className="visually-hidden"> {title}</span>
    </button>
  )
}

const RecipeView: FC<{ recipe: LibraryRecipe }> = ({ recipe }) => {
  const { title, localName } = splitTitle(recipe.name)
  useEffect(() => changeTitle(title), [title])
  const [people, setPeople] = usePeople()
  const lines = buildShoppingList([recipe], people, catalogue)
  const toBuy = lines.filter((l) => !l.staple)
  const staples = lines.filter((l) => l.staple)
  return (
    <main className="recipe-page">
      <div className="recipe-page__side">
        <div
          className={`recipe-panel recipe-card__tint--${tintFor(recipe.tags)}`}
        >
          <BackButton />
          <span
            className="recipe-panel__hero"
            aria-hidden="true"
          >
            <Icon
              icon={[
                'fas',
                heroIcon(recipe.ingredients.map((i) => i.ingredientId))
              ]}
            />
          </span>
          <SaveButton
            recipeName={title}
            libraryId={recipe.id}
          />
        </div>
        <h1 className="recipe-title">{title}</h1>
        {localName !== null && (
          <p
            className="recipe-local-name"
            lang="und"
          >
            {localName}
          </p>
        )}
        <p className="recipe-meta">{recipeMeta(recipe.tags)}</p>
        {/* Fixed slot for the amber "Contains: …" line; the library has no allergen data yet. */}
        <p
          className="recipe-allergens"
          aria-live="polite"
        />
        <ServesPicker
          people={people}
          onChange={setPeople}
        />
        <section aria-labelledby="recipe-buy">
          <h2
            id="recipe-buy"
            className="recipe-heading"
          >
            What to buy
          </h2>
          <ul className="list-rows">
            {toBuy.map((line) => (
              <li
                key={line.ingredientId}
                className="list-row recipe-buy"
              >
                <span className="list-row__line">
                  <span className="list-row__name">{displayName(line)}</span>
                  <span className="list-row__amount">{buyAmount(line)}</span>
                </span>
                <small>{usesLabel(line)}</small>
              </li>
            ))}
          </ul>
          {staples.length > 0 && (
            <p className="recipe-staples">
              You&apos;ll also need: {assumedNames(staples)}
            </p>
          )}
        </section>
        <div className="recipe-add-bar">
          <AddToList
            id={recipe.id}
            title={title}
          />
        </div>
      </div>
      {recipe.method.length > 0 && (
        <section
          className="recipe-method"
          aria-labelledby="recipe-method"
        >
          <h2
            id="recipe-method"
            className="recipe-heading"
          >
            Method
          </h2>
          <ol>
            {recipe.method.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}
    </main>
  )
}

/** /recipe/:id — shareable recipe page. */
const RecipePage: FC = () => {
  const recipe = findRecipe(useParams()['id'])
  return recipe === null ? (
    <main className="recipe-page">
      <p className="list-empty">
        Recipe not found. <Link to="/">All recipes</Link>
      </p>
    </main>
  ) : (
    <RecipeView recipe={recipe} />
  )
}

export default RecipePage
