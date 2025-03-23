import React, { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IngreIconSpin } from 'lib/icon/Icon'
import { Button } from 'react-bootstrap'

export const EditButton: FC<{
  getRecipeLoading: boolean
  handleEdit: any
  getRecipeError: any
  loggedIn?: boolean
}> = ({ getRecipeLoading, handleEdit, getRecipeError, loggedIn }) => {
  const navigate = useNavigate()
  return getRecipeLoading ? (
    'Loading'
  ) : getRecipeError ? (
    'Error'
  ) : !loggedIn ? (
    <Link
      to="/login"
      className="btn btn-primary"
    >
      Edit
    </Link>
  ) : (
    <Button
      onClick={(e) => {
        handleEdit(e)
        navigate('/customise')
      }}
    >
      Edit
    </Button>
  )
}

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
  return saveRecipeLoading ? (
    <IngreIconSpin />
  ) : !loggedIn ? (
    <Link
      to="/login"
      className="btn btn-primary"
    >
      Save
    </Link>
  ) : (
    <Button
      onClick={handleSave}
      disabled={isDisabled}
    >
      Save
    </Button>
  )
}

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
