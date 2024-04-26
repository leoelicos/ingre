import { Button, Empty, Space } from 'antd'
import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { changeTitle } from '../../utils/changeTitle.ts'

const NoMatch: FC = () => {
  changeTitle('ingré')

  return (
    <Empty>
      <Space direction="vertical">
        Page Not Found
        <Link to="/">
          <Button type="primary">Go home</Button>
        </Link>
      </Space>
    </Empty>
  )
}

export default NoMatch
