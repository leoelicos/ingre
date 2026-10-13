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
  edamamId: string
  loggedIn?: boolean
}> = ({ handleSave, savedRecipes, saveRecipeLoading, edamamId, loggedIn }) => {
  const isDisabled = React.useMemo(() => {
    return (
      saveRecipeLoading ||
      (savedRecipes.length > 0 &&
        savedRecipes.some((r) => r.edamamId === edamamId))
    )
  }, [saveRecipeLoading, savedRecipes, edamamId])
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
