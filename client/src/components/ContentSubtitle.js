import { Typography } from 'antd';
const { Title } = Typography;

const App = (props) => (
  <>
    <Title level={2} style={{ color: 'var(--ingre-blue)', fontFamily: 'Poppins, sans-serif', fontSize: '26px', letterSpacing: -1, fontWeight: '800' }}>
      {props.children}
    </Title>
  </>
);
export default App;
