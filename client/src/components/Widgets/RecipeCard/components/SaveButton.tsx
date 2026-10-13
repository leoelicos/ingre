import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { IngreIconSpin } from 'lib/icon/Icon'
import { Button } from 'react-bootstrap'

export const SaveButton: FC<{
  handleSave: any
  savedRecipes: any
  saveRecipeLoading: any
  edamamId: any
  loggedIn?: boolean
}> = ({ handleSave, savedRecipes, saveRecipeLoading, edamamId, loggedIn }) => {
  const isDisabled = React.useMemo(() => {
    return (
      saveRecipeLoading ||
      (savedRecipes.length > 0 &&
        savedRecipes.some((r: any) => r.edamamId === edamamId))
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
