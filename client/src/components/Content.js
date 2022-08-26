import { Layout } from 'antd';
const { Content } = Layout;
const App = (props) => {
  return (
    <Content
      style={{
        backgroundColor: 'var(--ingre-light-red)',
        padding: '1rem',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
        height: '100%',
        overflowY: 'auto'
      }}
    >
      {props.children}
    </Content>
  );
};
export default App;
