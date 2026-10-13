import type { FC } from 'react'
import type { ClientRecipe } from '../../../types/client'
import { useAuthContext } from '../../../utils/auth/AuthContext'
import RecipeCard from './RecipeCard'
import { recipeKey } from './recipeCardHelpers'
import './recipeCard.css'

const RecipeCardContainer: FC<{
  results: ClientRecipe[]
  loading: boolean
  onSavedPage: boolean
}> = ({ results, loading, onSavedPage }) => {
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
          />
        </li>
      ))}
    </ul>
  )
}

export default RecipeCardContainer
