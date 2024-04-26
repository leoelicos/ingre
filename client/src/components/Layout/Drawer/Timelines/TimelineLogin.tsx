import { Timeline } from 'antd'
import React, { FC } from 'react'

const { Item } = Timeline

const TimelineLogin: FC = () => {
  return (
    <Timeline>
      <Item color="green">Log in to start saving recipes!</Item>
    </Timeline>
  )
}
export default TimelineLogin
