import type { FC } from 'react'
import { useId } from 'react'
import type { ClientRecipe } from '../../../types/client'
import { IngreIconPro } from '../../../lib/icon/Icon'
import { HeroIcon } from './HeroIcon'
import { library } from '../../../utils/library/recipeLibrary'
import { useAuthContext } from '../../../utils/auth/AuthContext'
import type { PickControls } from './RecipeCardContainer'
import { SaveButton } from './components/SaveButton'
import {
  KeyIngredientList,
  keyNameIds
} from '../../IngredientBadge/KeyIngredients'
import { keyIngredientsFor } from '../../../utils/library/keyIngredients'
import { heroIcon, splitTitle } from './recipeCardHelpers'

const heroFor = (libraryId: string | undefined) =>
  heroIcon(
    library
      .filter((r) => r.id === libraryId)
      .flatMap((r) => r.ingredients.map((i) => i.ingredientId))
  )

interface RecipeCardProps {
  recipe: ClientRecipe
  pro: boolean
  pick: PickControls | null
}

const AddPill: FC<{ title: string; libraryId: string; pick: PickControls }> = ({
  title,
  libraryId,
  pick
}) => {
  const added = pick.pickedIds.has(libraryId)
  return (
    <button
      type="button"
      className="add-pill focus-visible:focus-ring"
      aria-pressed={added}
      aria-label={added ? `Remove ${title} from list` : `Add ${title} to list`}
      onClick={() => pick.onToggle(libraryId)}
    >
      {added ? '✓ Added' : '+ Add'}
    </button>
  )
}

/** Hero, heart, title link, key ingredient badges (names and sections as text) and + Add. */
const RecipeCard: FC<RecipeCardProps> = ({ recipe, pro, pick }) => {
  const [auth] = useAuthContext()
  const id = useId()
  const items = keyIngredientsFor(recipe.libraryId)
  const describedBy = keyNameIds(id, items)
  const loggedIn = auth.loggedIn
  const { title, localName } = splitTitle(recipe.name)
  return (
    <article className="recipe-card">
      <div className="recipe-card__tint recipe-card__tint--dinner">
        <span
          className="recipe-card__hero"
          aria-hidden="true"
        >
          <HeroIcon hero={heroFor(recipe.libraryId)} />
        </span>
        <SaveButton
          recipeName={title}
          libraryId={recipe.libraryId ?? recipe.name}
        />
      </div>
      <div className="recipe-card__body">
        <h3
          className="recipe-card__title"
          {...(describedBy === '' ? {} : { 'aria-describedby': describedBy })}
        >
          {title}
        </h3>
        {localName !== null && (
          <p
            className="recipe-card__local-name"
            lang="und"
          >
            {localName}
          </p>
        )}
        {items.length > 0 && (
          <div className="my-3">
            <KeyIngredientList
              items={items}
              idPrefix={id}
            />
          </div>
        )}
        {pick !== null && (
          <AddPill
            title={title}
            libraryId={recipe.libraryId ?? recipe.name}
            pick={pick}
          />
        )}
        {loggedIn && pro && (
          <a
            href={recipe.instructions}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IngreIconPro /> Instructions
          </a>
        )}
      </div>
    </article>
  )
}

export default RecipeCard
