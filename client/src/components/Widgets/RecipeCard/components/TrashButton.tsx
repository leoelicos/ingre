import type { ClientRecipe } from '../../../../types/client'
import React from 'react'
import type { FC } from 'react'
import { IngreIconSpin } from '../../../../lib/icon/Icon'

export const TrashButton: FC<{
  removeRecipeLoading: unknown
  handleRemove: () => void
  savedRecipes: ClientRecipe[]
  libraryId: unknown
}> = ({ removeRecipeLoading, handleRemove, savedRecipes, libraryId }) => {
  const isDisabled = React.useMemo(() => {
    const disabled =
      removeRecipeLoading ||
      !savedRecipes.some((r: ClientRecipe) => r.libraryId === libraryId)
    return disabled
  }, [removeRecipeLoading, savedRecipes, libraryId])
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
