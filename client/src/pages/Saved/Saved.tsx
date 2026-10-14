import type { FC } from 'react'
import { useEffect, useMemo } from 'react'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import { changeTitle } from '../../utils/changeTitle'
import { library, toClientRecipe } from '../../utils/library/recipeLibrary'
import { readFavourites } from '../../utils/storage/favourites'

/** Recipes hearted on this device (no account needed). */
export const Saved: FC = () => {
  useEffect(() => changeTitle('Saved'), [])
  const recipes = useMemo(() => {
    const favourites = readFavourites()
    return library
      .filter((r) => favourites.has(r.id))
      .map((r) => toClientRecipe(r))
  }, [])
  return (
    <main className="ingre-page">
      <h1 className="list-title">Saved</h1>
      {recipes.length === 0 ? (
        <p className="recipe-grid__status">
          Tap the heart on a recipe to keep it here.
        </p>
      ) : (
        <RecipeCardContainer
          results={recipes}
          loading={false}
        />
      )}
    </main>
  )
}
