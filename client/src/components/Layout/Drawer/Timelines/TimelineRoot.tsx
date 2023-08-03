import React, { FC } from 'react'
import { Button, Space, Timeline } from 'antd'
import {
  IngreIconCustomise,
  IngreIconSave,
  IngreIconSearch
} from '../../../../lib/icon/Icon'

const { Item } = Timeline

const TimelineRoot: FC = () => (
  <Timeline>
    <Item color="green">
      <Space
        direction="vertical"
        className="explore-buttons"
      >
        Explore recipes from your phone. Click
        <Button>Random</Button>
        or one of the popular options, or
        <Button type="primary">
          <Space>
            <IngreIconSearch />
            &nbsp;Search
          </Space>
        </Button>
        to find your own.
      </Space>
    </Item>
    <Item>
      <Space direction="vertical">
        Like a recipe? Save it!
        <Button style={{ borderRadius: '50%', padding: '4px 8px' }}>
          <IngreIconSave />
        </Button>
      </Space>
    </Item>
    <Item>
      Don&apos;t like it? Customise it
      <IngreIconCustomise /> it!
    </Item>
  </Timeline>
)

export default TimelineRoot
