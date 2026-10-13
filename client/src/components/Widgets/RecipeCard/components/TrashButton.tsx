import type { ClientRecipe } from '../../../../types/client'
import React from 'react'
import type { FC } from 'react'
import { IngreIconSpin } from '../../../../lib/icon/Icon'

export const TrashButton: FC<{
  removeRecipeLoading: unknown
  handleRemove: () => void
  savedRecipes: ClientRecipe[]
  edamamId: unknown
}> = ({ removeRecipeLoading, handleRemove, savedRecipes, edamamId }) => {
  const isDisabled = React.useMemo(() => {
    const disabled =
      removeRecipeLoading ||
      !savedRecipes.some((r: ClientRecipe) => r.edamamId === edamamId)
    return disabled
  }, [removeRecipeLoading, savedRecipes, edamamId])
  return removeRecipeLoading ? (
    <IngreIconSpin />
  ) : (
    <button
      onClick={handleRemove}
      disabled={!!isDisabled}
    >
      Delete
    </button>
  )
}
