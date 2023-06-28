import React, { FC } from 'react'
import RecipeCard from './RecipeCard.tsx'
import type { RecipeType } from '../../@types/recipe'

interface RecipeCardsProps {
  results: RecipeType[]
  pro: boolean
  onSavedPage: boolean
}

const RecipeCards: FC<RecipeCardsProps> = ({ results, pro, onSavedPage }) => {
  return results?.map((recipe, idx) => {
    return (
      <RecipeCard
        key={idx}
        recipe={recipe}
        onSavedPage={onSavedPage}
        pro={pro}
      />
    )
  })
}
export default RecipeCards
