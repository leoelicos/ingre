import React, { FC } from 'react'
import { Button, Timeline } from 'antd'
import {
  IngreIconAddIngredient,
  IngreIconRemove
} from '../../../../lib/icon/Icon'

const { Item } = Timeline

const TimelineCustomise: FC = () => {
  return (
    <Timeline>
      <Item color="green">Make it your own.</Item>
      <Item>Customise a recipe, or Reset to start again! </Item>
      <Item color="blue">To edit recipe name, click on the box to type.</Item>
      <Item color="blue">
        For servings and quantities, enter a number or a decimal.
      </Item>
      <Item color="blue">
        To add a new ingredient, click on{' '}
        <Button
          type="primary"
          block
          icon={<IngreIconAddIngredient />}
          shape="round"
        >
          <span style={{ marginLeft: '4px' }}>Ingredient</span>
        </Button>
      </Item>
      <Item color="red">
        To delete an existing ingredient, click on{' '}
        <Button
          type="default"
          block
          danger
          icon={<IngreIconRemove />}
          shape="round"
        >
          <span style={{ marginLeft: '4px' }}>Clear all</span>
        </Button>
        .
      </Item>
    </Timeline>
  )
}
export default TimelineCustomise
