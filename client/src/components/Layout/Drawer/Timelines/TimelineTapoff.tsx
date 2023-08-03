import React, { FC } from 'react'
import { Timeline } from 'antd'

const { Item } = Timeline

const TimelineTapoff: FC = () => {
  return (
    <Timeline>
      <Item color="green">
        Tap off each ingredient as you shop in the supermarket.
      </Item>
      <Item color="blue">
        Good luck! When you&apos;re done, click &apos;All done&apos; to clear
        your Saved recipes and Shopping list.
      </Item>
    </Timeline>
  )
}
export default TimelineTapoff
