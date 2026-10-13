import React from 'react'
import type { ClientRecipe } from '../../../../types/client'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { IngreIconSpin } from '../../../../lib/icon/Icon'
import { Button } from 'react-bootstrap'

export const SaveButton: FC<{
  handleSave: () => void
  savedRecipes: ClientRecipe[]
  saveRecipeLoading: boolean
  libraryId: string
  loggedIn?: boolean
}> = ({ handleSave, savedRecipes, saveRecipeLoading, libraryId, loggedIn }) => {
  const isDisabled = React.useMemo(() => {
    return (
      saveRecipeLoading ||
      (savedRecipes.length > 0 &&
        savedRecipes.some((r) => r.libraryId === libraryId))
    )
  }, [saveRecipeLoading, savedRecipes, libraryId])
  const navigate = useNavigate()
  return saveRecipeLoading ? (
    <IngreIconSpin />
  ) : isDisabled ? (
    <Button disabled>Save</Button>
  ) : (
    <Button
      onClick={
        loggedIn
          ? handleSave
          : () => {
              navigate('/login')
            }
      }
    >
      Save
    </Button>
  )
}
