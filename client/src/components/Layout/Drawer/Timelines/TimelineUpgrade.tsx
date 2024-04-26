import { Alert, Button, Space, Timeline } from 'antd'
import React, { FC } from 'react'

const { Item } = Timeline

const TimelineUpgrade: FC<{ pro: boolean }> = ({ pro }) =>
  pro ? (
    <Timeline>
      <Item color="green">
        <Alert
          type="success"
          message="You are already PRO!"
        />
      </Item>
    </Timeline>
  ) : (
    <Timeline>
      <Item color="green"> How to upgrade to ingré PRO</Item>
      <Item color="blue">
        <Space direction="vertical">
          Click
          <Button
            type="primary"
            shape="round"
          >
            Checkout with Stripe
          </Button>
        </Space>
      </Item>
      <Item color="blue">You will be redirected to Stripe&apos;s POS.</Item>
      <Item color="blue">Pay with Stripe.</Item>
      <Item color="green">You will be redirected back to ingré.</Item>
    </Timeline>
  )

export default TimelineUpgrade
