import type { FC } from 'react'
import type { ClientRecipe } from '../../../types/client'
import { Icon, IngreIconPro } from '../../../lib/icon/Icon'
import { library } from '../../../utils/library/recipeLibrary'
import { useAuthContext } from '../../../utils/auth/AuthContext'
import type { PickControls } from './RecipeCardContainer'
import { useRecipeCard } from './useRecipeCard'
import { SaveButton } from './components/SaveButton'
import { heroIcon, splitTitle, tintFor } from './recipeCardHelpers'

const heroFor = (libraryId: string | undefined) =>
  heroIcon(
    library
      .filter((r) => r.id === libraryId)
      .flatMap((r) => r.ingredients.map((i) => i.ingredientId))
  )

interface RecipeCardProps {
  recipe: ClientRecipe
  onSavedPage: boolean
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
      className="add-pill"
      aria-pressed={added}
      onClick={() => pick.onToggle(libraryId)}
    >
      {added ? '✓ Added' : '+ Add'}
      <span className="visually-hidden"> {title}</span>
    </button>
  )
}

const RecipeCard: FC<RecipeCardProps> = ({
  recipe,
  onSavedPage,
  pro,
  pick
}) => {
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn
  const { handleSave, savedRecipes, saveRecipeLoading } = useRecipeCard({
    recipe,
    onSavedPage
  })
  const { title, localName } = splitTitle(recipe.name)
  return (
    <article className="recipe-card">
      <div
        className={`recipe-card__tint recipe-card__tint--${tintFor(
          recipe.tags
        )}`}
      >
        <span
          className="recipe-card__hero"
          aria-hidden="true"
        >
          <Icon icon={['fas', heroFor(recipe.libraryId)]} />
        </span>
        <SaveButton
          recipeName={title}
          handleSave={handleSave}
          savedRecipes={savedRecipes}
          saveRecipeLoading={saveRecipeLoading}
          libraryId={recipe.libraryId ?? ''}
          loggedIn={loggedIn}
        />
      </div>
      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{title}</h3>
        {localName !== null && (
          <p
            className="recipe-card__local-name"
            lang="und"
          >
            {localName}
          </p>
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
