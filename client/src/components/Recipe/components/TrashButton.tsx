import { Button, Tooltip } from 'antd'
import React, { FC } from 'react'
import { IngreIconRemove, IngreIconSpin } from '../../Icons/Icon.tsx'

const TrashButton: FC<{
  removeRecipeLoading: any
  handleRemove: any
  savedRecipes: any
  edamamId: any
}> = ({ removeRecipeLoading, handleRemove, savedRecipes, edamamId }) => (
  <Tooltip
    color="var(--ingre-dark-brown)"
    placement="top"
    title="Unsave"
    className="button-tooltip"
  >
    <Button
      key="removeButton"
      disabled={
        removeRecipeLoading ||
        !savedRecipes.some((r: any) => r.edamamId === edamamId)
      }
      onClick={handleRemove}
      style={{
        borderRadius: '50%',
        padding: '4px 8px'
      }}
    >
      {removeRecipeLoading ? <IngreIconSpin /> : <IngreIconRemove />}
    </Button>
  </Tooltip>
)

export default TrashButton
