import React, { FC } from 'react'
import { Timeline } from 'antd'

const { Item } = Timeline

const TimelineSignup: FC = () => {
  return (
    <Timeline>
      <Item color="green">Sign up to start saving recipes!</Item>
    </Timeline>
  )
}
export default TimelineSignup
