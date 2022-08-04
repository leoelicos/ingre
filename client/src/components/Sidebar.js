import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Layout, Menu, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import React from 'react';

const { Sider } = Layout;

function getItem(key, icon, label) {
  return { key, icon, label };
}

const items = [
  getItem(
    '1',
    <Link to="/">
      <FontAwesomeIcon icon="fa-solid fa-cookie" />
    </Link>,
    <Button type="link">
      <Link to="/">Home</Link>
    </Button>
  ),
  getItem(
    '2',
    <Link to="/search">
      <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />{' '}
    </Link>,
    <Button type="link">
      <Link to="/search">Search</Link>{' '}
    </Button>
  ),
  getItem(
    '3',
    <Link to="/custom">
      <FontAwesomeIcon icon="fa-solid fa-pen" />{' '}
    </Link>,
    <Button type="link">
      <Link to="/custom">Custom</Link>{' '}
    </Button>
  ),
  getItem(
    '4',
    <Link to="/saved">
      <FontAwesomeIcon icon="fa-solid fa-floppy-disk" />{' '}
    </Link>,
    <Button type="link">
      <Link to="/saved">Saved</Link>{' '}
    </Button>
  ),
  getItem(
    '5',
    <Link to="/shoppinglist">
      <FontAwesomeIcon icon="fa-solid fa-cart-shopping" />{' '}
    </Link>,
    <Button type="link">
      <Link to="/shoppinglist">Shopping List</Link>{' '}
    </Button>
  ),
  getItem(
    '6',
    <Link to="/tapoff">
      <FontAwesomeIcon icon="fa-solid fa-circle" />{' '}
    </Link>,
    <Button type="link">
      <Link to="/tapoff">Tap Off</Link>{' '}
    </Button>
  )
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <Menu mode="inline" defaultSelectedKeys={['1']} items={items} />
      </Sider>
    </Layout>
  );
};

export default App;
