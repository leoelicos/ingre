import { Timeline } from 'antd'
import React, { FC } from 'react'

const { Item } = Timeline

const TimelineInvalid: FC = () => {
  return (
    <Timeline>
      <Item color="green">Please check that you are on a valid page.</Item>
    </Timeline>
  )
}
export default TimelineInvalid
