import { Layout, Divider } from 'antd';
const App = (props) => {
  /// la di da

  return (
    <Layout>
      <Divider>Divider</Divider>
      {props.children}
    </Layout>
  );
};
export default App;
