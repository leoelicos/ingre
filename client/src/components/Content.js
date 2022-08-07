import { Layout } from 'antd';
const { Content } = Layout;
const App = (props) => {
  return (
    <Content
      style={{
        backgroundColor: 'var(--ingre-light-red)',
        borderColor: '1px solid red',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      {props.children}
    </Content>
  );
};
export default App;
