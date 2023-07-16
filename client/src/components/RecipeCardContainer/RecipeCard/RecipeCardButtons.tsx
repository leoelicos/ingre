import { Button, Space, Tooltip, Typography } from 'antd'
import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import {
  IngreIconCustomise,
  IngreIconPortion,
  IngreIconPro,
  IngreIconRemove,
  IngreIconSave,
  IngreIconSpin
} from '../../../lib/icon/Icon.tsx'

export const DisabledEditButton: FC = () => (
  <Tooltip
    placement="top"
    title={
      <Link to="/login">
        <Button type="primary">Log in</Button>
      </Link>
    }
  >
    <Button
      disabled
      style={{
        borderRadius: '50%',
        padding: '4px 8px'
      }}
    >
      <IngreIconCustomise />
    </Button>
  </Tooltip>
)

export const DisabledSaveButton: FC = () => (
  <Tooltip
    placement="top"
    title={
      <Link to="/login">
        <Button type="primary">Log in</Button>
      </Link>
    }
  >
    <Button
      disabled
      style={{
        borderRadius: '50%',
        padding: '4px 8px'
      }}
    >
      <IngreIconSave />
    </Button>
  </Tooltip>
)

export const DisabledTrashButton: FC = () => (
  <Tooltip
    placement="top"
    title={
      <Link to="/login">
        <Button type="primary">Log in</Button>
      </Link>
    }
  >
    <Button
      disabled
      style={{
        borderRadius: '50%',
        padding: '4px 8px'
      }}
    >
      <IngreIconRemove />
    </Button>
  </Tooltip>
)

export const EditButton: FC<{
  getRecipeLoading: boolean // load from server
  handleEdit: any
  getRecipeError: any // load from server
}> = ({ getRecipeLoading, handleEdit, getRecipeError }) => (
  <Tooltip
    color="var(--ingre-dark-brown)"
    placement="top"
    title="Edit"
    className="button-tooltip"
  >
    <Button
      loading={getRecipeLoading}
      disabled={getRecipeError}
      onClick={handleEdit}
      style={{
        borderRadius: '50%',
        padding: '4px 8px'
      }}
    >
      <Link to="/customise">
        <IngreIconCustomise />
      </Link>
    </Button>
  </Tooltip>
)

export const InstructionsButton: FC<{
  handleRemove: any
  instructions: any
}> = ({ handleRemove, instructions }) => (
  <Tooltip
    color="var(--ingre-dark-brown)"
    placement="top"
    title={<Space size="small">Cooking instructions</Space>}
  >
    <Button
      key="removeButton"
      onClick={handleRemove}
      style={{
        borderRadius: '50%',
        padding: '4px 7px'
      }}
      shape="circle"
    >
      <a
        href={instructions}
        target="_blank"
        rel="noopener noreferrer"
      >
        <IngreIconPro />
      </a>
    </Button>
  </Tooltip>
)

export const PortionsButton: FC<{ portions: number }> = ({ portions }) => (
  <Tooltip
    color="var(--ingre-dark-brown)"
    placement="top"
    title={`Serves ${portions} people`}
    className="button-tooltip"
  >
    <IngreIconPortion />
    <Typography.Text>{portions}</Typography.Text>
  </Tooltip>
)

export const SaveButton: FC<{
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

export const TrashButton: FC<{
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
