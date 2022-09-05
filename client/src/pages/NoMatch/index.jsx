// React
import { useEffect } from 'react';

// React Router Dom
import { Link } from 'react-router-dom';

// Ant components
import { Button, Space } from 'antd';

// Custom components
import Empty from '../../components/Empty';

const App = () => {
  useEffect(() => {
    document.title = 'ingré Not Found';
  }, []);

  return (
    <Empty>
      <Space direction="vertical">
        Page Not Found
        <Link to="/">
          <Button type="primary">Go home</Button>
        </Link>
      </Space>
    </Empty>
  );
};

export default App;
