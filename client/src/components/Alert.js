import { Alert } from 'antd';
const App = (props) => {
  return (
    <Alert
      type={props.type}
      message={props.message}
      style={{ margin: '4px 0' }}
      //
    >
      {props.children}
    </Alert>
  );
};
export default App;
