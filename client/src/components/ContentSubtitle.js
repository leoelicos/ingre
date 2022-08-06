import { Typography } from 'antd';
const { Title } = Typography;

const App = (props) => (
  <>
    <Title level={2}>{props.children}</Title>
  </>
);
export default App;
