import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { useStoreContext } from '../utils/state/GlobalState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const { Sider } = Layout;
const App = () => {
  const [state] = useStoreContext();
  return (
    <Sider trigger={null} collapsible collapsed={state.leftSidebarCollapsed} style={{ background: 'pink' }}>
      <div className="logo" />
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={['1']}
        items={[
          {
            key: 1,
            icon: (
              <Link to="/">
                <FontAwesomeIcon icon="fa-solid fa-cookie" />
              </Link>
            ),
            label: 'Home'
          },
          {
            key: 2,
            icon: (
              <Link to="/search">
                <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
              </Link>
            ),
            label: 'Search'
          },
          {
            key: 3,
            icon: (
              <Link to="/custom">
                <FontAwesomeIcon icon="fa-solid fa-pen" />
              </Link>
            ),
            label: 'Custom'
          },
          {
            key: 4,
            icon: (
              <Link to="/saved">
                <FontAwesomeIcon icon="fa-solid fa-floppy-disk" />
              </Link>
            ),
            label: 'Saved'
          },
          {
            key: 5,
            icon: (
              <Link to="/shoppinglist">
                <FontAwesomeIcon icon="fa-solid fa-cart-shopping" />
              </Link>
            ),
            label: 'Shopping List'
          },
          {
            key: 6,
            icon: (
              <Link to="/tapoff">
                <FontAwesomeIcon icon="fa-solid fa-square-check" />
              </Link>
            ),
            label: 'Tap Off'
          }
        ]}
      />
    </Sider>
  );
};

export default App;
