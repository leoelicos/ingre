import { Typography } from 'antd'
const { Title } = Typography

const App = (props) => (
  <>
    <Title
      level={1}
      style={{
        color: 'var(--ingre-dark-brown)',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '36px',
        letterSpacing: -1,
        fontWeight: '800',
        margin: '0.6rem 0',
        textAlign: 'center'
        //
      }}
    >
      {props.children}
    </Title>
  </>
)
export default App
