import { Button, Tooltip } from 'antd'
import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { IngreIconCustomise } from '../../../Icons/Icon.tsx'

const DisabledEditButton: FC = () => (
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
export default DisabledEditButton
