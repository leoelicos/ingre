import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { useStoreContext } from '../utils/state/GlobalState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation } from 'react-router-dom';
const { Sider } = Layout;
const App = () => {
  const location = useLocation();
  const { pathname } = location;
  const [state] = useStoreContext();
  const getKey = () => {
    if (pathname === '/search') return '2';
    else if (pathname === '/custom') return '3';
    else if (pathname === '/saved') return '4';
    else if (pathname === '/shoppinglist') return '5';
    else if (pathname === '/tapoff') return '6';
    return '1';
  };
  return (
    <Sider trigger={null} collapsible collapsed={state.leftSidebarCollapsed} style={{ background: 'var(--ingre-white)' }}>
      <div className="logo" />
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={['1']}
        selectedKeys={[getKey()]}
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
            label: (
              <>
                Saved <span style={{ fontSize: '1rem', padding: '0 0.4rem', borderRadius: '50%', color: 'var(--ingre-white)', background: 'var(--ingre-dark-brown)' }}>{state.savedRecipes.length}</span>
              </>
            )
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
