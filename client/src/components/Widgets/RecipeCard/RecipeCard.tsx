import type { FC } from 'react'
import { Link } from 'react-router-dom'
import type { ClientRecipe } from '../../../types/client'
import { IngreIconPro } from '../../../lib/icon/Icon'
import { HeroIcon } from './HeroIcon'
import { library } from '../../../utils/library/recipeLibrary'
import { useAuthContext } from '../../../utils/auth/AuthContext'
import type { PickControls } from './RecipeCardContainer'
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

const RecipeCard: FC<RecipeCardProps> = ({ recipe, pro, pick }) => {
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn
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
          <HeroIcon hero={heroFor(recipe.libraryId)} />
        </span>
        <SaveButton
          recipeName={title}
          libraryId={recipe.libraryId ?? recipe.name}
        />
      </div>
      <div className="recipe-card__body">
        <h3 className="recipe-card__title">
          {recipe.libraryId === undefined ? (
            title
          ) : (
            <Link
              to={`/recipe/${recipe.libraryId}`}
              className="recipe-card__link"
            >
              {title}
            </Link>
          )}
        </h3>
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
