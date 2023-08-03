import React, { FC } from 'react'
import { Timeline } from 'antd'
import {
  IngreIconClearSearch,
  IngreIconCustomise,
  IngreIconSave,
  IngreIconSearch
} from '../../../../lib/icon/Icon'

const { Item } = Timeline

const TimelineSearch: FC = () => {
  return (
    <Timeline>
      <Item color="green">Search from 2 million tested recipes. </Item>
      <Item color="blue">
        Enter a search term and click <IngreIconSearch /> or type Enter.
      </Item>
      <Item color="red">
        To clear search, click <IngreIconClearSearch />.
      </Item>
      <Item>
        To narrow your search, select from our many filters available.
      </Item>
      <Item>
        Like a recipe? Click <IngreIconSave /> to add it to your Saved list.
      </Item>
      <Item>
        You can also <IngreIconCustomise /> customise them!
      </Item>
    </Timeline>
  )
}
export default TimelineSearch
