import { Typography } from 'antd';
const { Title } = Typography;

const App = (props) => (
  <>
    <Title level={1}>{props.children}</Title>
  </>
);
export default App;
