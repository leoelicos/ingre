import { Layout } from 'antd';
const { Content } = Layout;
const App = (props) => {
  return (
    <Content
      style={{
        backgroundColor: 'var(--ingre-light-red)',
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
        minHeight: '100%'
      }}
    >
      {props.children}
    </Content>
  );
};
export default App;
