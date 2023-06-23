// Ant
import { Typography } from 'antd'

// Ant subcomponents
const { Title } = Typography

const titleStyle = {
  color: 'var(--ingre-blue)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '26px',
  letterSpacing: -1,
  fontWeight: '800',
  margin: '0.3rem 0'
}

const ContentSubtitle = (props) => (
  <Title
    level={2}
    style={titleStyle}
  >
    {props.children}
  </Title>
)
export default ContentSubtitle
