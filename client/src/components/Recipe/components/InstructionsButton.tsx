import { Button, Space, Tooltip } from 'antd'
import React, { FC } from 'react'
import { IngreIconPro } from '../../Icons/Icon.tsx'

const InstructionsButton: FC<{ handleRemove: any; instructions: any }> = ({
  handleRemove,
  instructions
}) => (
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
export default InstructionsButton
