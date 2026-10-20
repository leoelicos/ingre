import type { FC } from 'react'
import { useEffect, useId } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ServesPicker } from '../../components/ServesPicker'
import { SaveButton } from '../../components/Widgets/RecipeCard/components/SaveButton'
import {
  heroIcon,
  splitTitle,
  tintFor
} from '../../components/Widgets/RecipeCard/recipeCardHelpers'
import { IngreIconBack } from '../../lib/icon/Icon'
import { HeroIcon } from '../../components/Widgets/RecipeCard/HeroIcon'
import type { LibraryRecipe } from '../../types/library'
import { changeTitle } from '../../utils/changeTitle'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { catalogue, library } from '../../utils/library/recipeLibrary'
import { containsLine, recipeAllergens } from '../../utils/library/allergens'
import {
  assumedNames,
  buildShoppingList,
  buyAmount,
  displayName,
  usesLabel
} from '../../utils/shopping/shoppingList'
import { usePeople } from '../../utils/storage/people'
import { KeyIngredientList } from '../../components/IngredientBadge/KeyIngredients'
import { keyIngredientsOf } from '../../utils/library/keyIngredients'
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
      className="recipe-panel__back focus-visible:focus-ring"
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
      aria-label={`${capitaliseFirst(title)} is on your list. View list`}
    >
      ✓ Added · View list
    </Link>
  ) : (
    <button
      type="button"
      className="btn btn-primary recipe-add"
      aria-label={`Add ${title} to list`}
      onClick={() => togglePicked(id)}
    >
      + Add to list
    </button>
  )
}

/** The same key ingredient badges as the recipe's card (#155); nothing when it names none. */
export const KeyIngredients: FC<{ recipe: LibraryRecipe }> = ({ recipe }) => {
  const id = useId()
  const items = keyIngredientsOf(recipe)
  return items.length === 0 ? null : (
    <section
      aria-labelledby={`${id}-heading`}
      className="mt-4"
    >
      <h2
        id={`${id}-heading`}
        className="recipe-heading"
      >
        Key ingredients
      </h2>
      <KeyIngredientList
        items={items}
        idPrefix={id}
      />
    </section>
  )
}

const RecipeView: FC<{ recipe: LibraryRecipe }> = ({ recipe }) => {
  const { title, localName } = splitTitle(recipe.name)
  useEffect(() => changeTitle(title), [title])
  const [people, setPeople] = usePeople()
  const lines = buildShoppingList([recipe], people, catalogue)
  const toBuy = lines.filter((l) => !l.staple)
  const staples = lines.filter((l) => l.staple)
  const contains = containsLine(recipeAllergens(recipe, catalogue))
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
            <HeroIcon
              hero={heroIcon(recipe.ingredients.map((i) => i.ingredientId))}
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
        {contains !== '' && <p className="recipe-allergens">{contains}</p>}
        <KeyIngredients recipe={recipe} />
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
          <p className="recipe-method__note">Amounts are in the buy list</p>
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
    <main className="recipe-page recipe-missing">
      <h1 className="recipe-title">We couldn&apos;t find that recipe</h1>
      <p className="list-note">
        The link may be old or mistyped. Have a look through what we have.
      </p>
      <Link
        to="/"
        className="btn btn-primary recipe-missing__link"
      >
        Back to Recipes
      </Link>
    </main>
  ) : (
    <RecipeView recipe={recipe} />
  )
}

export default RecipePage
