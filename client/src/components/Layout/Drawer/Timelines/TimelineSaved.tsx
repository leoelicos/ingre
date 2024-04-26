import { Timeline } from 'antd'
import React, { FC } from 'react'
import {
  IngreIconCustomise,
  IngreIconPro,
  IngreIconRemove
} from '../../../../lib/icon/Icon'

const { Item } = Timeline

const TimelineSaved: FC = () => {
  return (
    <Timeline>
      <Item color="green">Your saved recipes are stored here for 24 hours</Item>
      <Item>All your recipes in one place!</Item>
      <Item color="blue">
        Click <IngreIconCustomise /> to edit recipes.
      </Item>
      <Item color="blue">
        Click <IngreIconRemove /> to remove recipes.
      </Item>
      <Item color="red">Your recipes will be deleted after 24 hours.</Item>
      <Item color="blue">
        Upgrade to <IngreIconPro /> PRO for $5 to save recipes permanently.
      </Item>
    </Timeline>
  )
}
export default TimelineSaved
