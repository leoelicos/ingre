import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Layout, Menu } from 'antd';

const { Sider } = Layout;

const App = (collapsed) => {
  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <FontAwesomeIcon icon="fa-solid fa-cookie" />,
              label: 'Home'
            },
            {
              key: '2',
              icon: <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />,
              label: 'Search'
            },
            {
              key: '3',
              icon: <FontAwesomeIcon icon="fa-solid fa-pen" />,
              label: 'Custom'
            },
            {
              key: '4',
              icon: <FontAwesomeIcon icon="fa-solid fa-floppy-disk" />,
              label: 'Saved'
            },
            {
              key: '5',
              icon: <FontAwesomeIcon icon="fa-solid fa-cart-shopping" />,
              label: 'Shopping list'
            },
            {
              key: '6',
              icon: <FontAwesomeIcon icon="fa-solid fa-circle" />,
              label: 'Tap Off'
            }
          ]}
        />
      </Sider>
    </Layout>
  );
};

export default App;
