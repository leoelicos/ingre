import React, { FC } from 'react'
import { Button, Tooltip } from 'antd'
import { IngreIconSave, IngreIconSpin } from '../../Icons/Icon.tsx'

const SaveButton: FC<{
  handleSave: any
  savedRecipes: any
  saveRecipeLoading: any
  edamamId: any
}> = ({ handleSave, savedRecipes, saveRecipeLoading, edamamId }) => {
  return (
    <Tooltip
      color="var(--ingre-dark-brown)"
      placement="top"
      title="Save"
      className="button-tooltip"
    >
      <Button
        key="saveButton"
        onClick={handleSave}
        disabled={
          saveRecipeLoading ||
          (savedRecipes.length > 0 &&
            savedRecipes.some((r: any) => r.edamamId === edamamId))
        }
        style={{
          borderRadius: '50%',
          padding: '4px 8px'
        }}
      >
        {saveRecipeLoading ? <IngreIconSpin /> : <IngreIconSave />}
      </Button>
    </Tooltip>
  )
}
export default SaveButton
