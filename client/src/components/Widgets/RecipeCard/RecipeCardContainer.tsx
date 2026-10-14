import type { FC } from 'react'
import type { ClientRecipe } from '../../../types/client'
import { useAuthContext } from '../../../utils/auth/AuthContext'
import RecipeCard from './RecipeCard'
import { recipeKey } from './recipeCardHelpers'
import './recipeCard.css'

/** Shopping-list picking: shows "+ Add" / "✓ Added" on each card. */
export interface PickControls {
  pickedIds: ReadonlySet<string>
  onToggle: (libraryId: string) => void
}

const RecipeCardContainer: FC<{
  results: ClientRecipe[]
  loading: boolean
  onSavedPage: boolean
  pick?: PickControls | null
}> = ({ results, loading, onSavedPage, pick = null }) => {
  const [auth] = useAuthContext()
  const pro = auth.profile?.data.pro || false
  if (loading) return <p className="recipe-grid__status">Loading recipes…</p>
  if (results.length === 0)
    return <p className="recipe-grid__status">No recipes</p>
  return (
    <ul className="recipe-grid">
      {results.map((recipe) => (
        <li key={recipeKey(recipe)}>
          <RecipeCard
            recipe={recipe}
            onSavedPage={onSavedPage}
            pro={pro}
            pick={pick}
          />
        </li>
      ))}
    </ul>
  )
}

export default RecipeCardContainer
