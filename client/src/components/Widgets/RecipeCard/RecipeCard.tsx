import type { FC } from 'react'
import type { ClientRecipe } from '../../../types/client'
import { IngreIconPro } from '../../../lib/icon/Icon'
import { useAuthContext } from '../../../utils/auth/AuthContext'
import { useRecipeCard } from './useRecipeCard'
import { SaveButton } from './components/SaveButton'
import { splitTitle, tintFor } from './recipeCardHelpers'

interface RecipeCardProps {
  recipe: ClientRecipe
  onSavedPage: boolean
  pro: boolean
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe, onSavedPage, pro }) => {
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
