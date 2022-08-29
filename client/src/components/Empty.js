import { Empty } from 'antd';

const App = (props) => {
  return <Empty style={{ marginTop: '5vh' }} description={props.children}></Empty>;
};

export default App;
