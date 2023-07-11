import { Button, Tooltip } from 'antd'
import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { IngreIconCustomise } from '../../../Icons/Icon.tsx'

const EditButton: FC<{
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
export default EditButton
