// React
import { useEffect } from 'react'

// React Router Dom
import { Link } from 'react-router-dom'

// Ant components
import { Button, Empty, Space } from 'antd'

// Custom components

const App = () => {
  useEffect(() => {
    document.title = 'ingré Not Found'
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

export default App
