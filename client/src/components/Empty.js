import { Empty } from 'antd';

const App = (props) => {
  return <Empty style={{ marginTop: '20vh' }}>{props.children}</Empty>;
};

export default App;
