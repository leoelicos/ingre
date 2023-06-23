// React
import { useEffect } from 'react'

// React Router Dom
import { Link } from 'react-router-dom'

// Ant
import { Button, Empty, Space } from 'antd'

const NoMatch = () => {
  useEffect(() => {
    document.title = 'ingré'
  }, [])

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
