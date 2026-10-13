import React, { FC } from 'react'
import { IngreIconSpin } from 'lib/icon/Icon'

export const TrashButton: FC<{
  removeRecipeLoading: any
  handleRemove: any
  savedRecipes: any
  edamamId: any
}> = ({ removeRecipeLoading, handleRemove, savedRecipes, edamamId }) => {
  const isDisabled = React.useMemo(() => {
    const disabled =
      removeRecipeLoading ||
      !savedRecipes.some((r: any) => r.edamamId === edamamId)
    return disabled
  }, [removeRecipeLoading, savedRecipes, edamamId])
  return removeRecipeLoading ? (
    <IngreIconSpin />
  ) : (
    <button
      onClick={handleRemove}
      disabled={isDisabled}
    >
      Delete
    </button>
  )
}
