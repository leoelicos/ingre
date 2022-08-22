import { Layout, Row } from 'antd';

const App = (props) => {
  return (
    <Layout
      style={{
        width: '100%',
        justifyContent: 'center'

        //
      }}
    >
      <Row
        style={{
          width: '100%',
          maxWidth: '1264px',
          alignItems: 'flex-start',
          background: 'white'
          //
        }}
      >
        {props.children}
      </Row>
    </Layout>
  );
};
export default App;
