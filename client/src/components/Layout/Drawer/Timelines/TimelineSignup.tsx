import { Timeline } from 'antd'
import React, { FC } from 'react'

const { Item } = Timeline

const TimelineSignup: FC = () => {
  return (
    <Timeline>
      <Item color="green">Sign up to start saving recipes!</Item>
    </Timeline>
  )
}
export default TimelineSignup
