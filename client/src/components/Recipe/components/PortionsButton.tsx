import { Typography, Tooltip } from 'antd'
import React, { FC } from 'react'
import { IngreIconPortion } from '../../Icons/Icon.tsx'

const PortionsButton: FC<{ portions: number }> = ({ portions }) => (
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

export default PortionsButton
