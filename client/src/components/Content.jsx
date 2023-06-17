// Ant Components
import { Layout } from 'antd'
// components
import Drawer from './Drawer'

// Ant subcomponents
const { Content } = Layout

const contentStyle = {
  backgroundColor: 'var(--ingre-light-red)',
  padding: '1rem',
  display: 'flex',
  flexFlow: 'column nowrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flex: 1,
  height: '100%',
  overflowY: 'auto'
}

const App = (props) => {
  return (
    <Content style={contentStyle}>
      {props.children}
      <Drawer />
    </Content>
  )
}
export default App
