import React, { FC } from 'react'
import { Button, Timeline } from 'antd'
import {
  IngreIconAddIngredient,
  IngreIconRemove
} from '../../../../lib/icon/Icon'

const { Item } = Timeline

const TimelineIngredients: FC = () => {
  return (
    <Timeline>
      <Item color="green">The final edit!</Item>
      <Item>Have you checked your fridge? Is it in season? Edit away!</Item>
      <Item color="blue">
        Click{' '}
        <Button
          type="primary"
          block
          icon={<IngreIconAddIngredient />}
          shape="round"
        >
          <span style={{ marginLeft: '4px' }}>Ingredient</span>
        </Button>{' '}
        to add a new ingredient.
      </Item>
      <Item color="red">
        Click <IngreIconRemove /> to remove an ingredient.
      </Item>
      <Item>There is a Misc section for additional groceries!</Item>
    </Timeline>
  )
}
export default TimelineIngredients
