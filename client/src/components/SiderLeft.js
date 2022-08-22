import { Layout, Menu, Space } from 'antd';
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
    <Sider
      trigger={null}
      collapsible
      collapsed={state.leftSidebarCollapsed}
      collapsedWidth="60px"
      style={{
        // background: 'var(--ingre-white)',
        minWidth: '40px !important',
        background: 'blue'
        //
      }}
    >
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
                <FontAwesomeIcon
                  icon="fa-solid fa-cookie"
                  style={{ width: '19.19px' }}
                  //
                />
              </Link>
            ),
            label: <Link to="/">Recipes</Link>
          },
          {
            key: 2,
            icon: (
              <Link to="/search">
                <FontAwesomeIcon
                  icon="fa-solid fa-magnifying-glass"
                  style={{ width: '19.19px' }}
                  //
                />
              </Link>
            ),
            label: <Link to="/search">Search</Link>
          },
          {
            key: 3,
            icon: (
              <Link to="/custom">
                <FontAwesomeIcon
                  icon="fa-solid fa-pen"
                  style={{ width: '19.19px' }}
                  //
                />
              </Link>
            ),
            label: <Link to="/custom">Custom</Link>
          },
          {
            key: 4,
            icon: (
              <Link to="/saved">
                <FontAwesomeIcon
                  icon="fa-solid fa-floppy-disk"
                  style={{ width: '19.19px' }}
                  //
                />
              </Link>
            ),
            label: (
              <Link to="/saved">
                <Space>
                  Saved
                  <span
                    style={{
                      fontSize: '1rem',
                      padding: '0 0.4rem',
                      borderRadius: '50%',
                      color: 'var(--ingre-white)',
                      background: 'var(--ingre-dark-brown)'
                      //
                    }}
                  >
                    {state.savedRecipes.length}
                  </span>
                </Space>
              </Link>
            )
          },
          {
            key: 5,
            icon: (
              <Link to="/shoppinglist" style={{ width: '19.19px', transform: 'translateX(1px)' }}>
                <FontAwesomeIcon icon="fa-solid fa-egg" />
              </Link>
            ),
            label: <Link to="/shoppinglist">Ingredients</Link>
          },
          {
            key: 6,
            icon: (
              <Link to="/tapoff">
                <FontAwesomeIcon icon="fa-solid fa-square-check" style={{ width: '19.19px' }} />
              </Link>
            ),
            label: <Link to="/tapoff">Tap</Link>
          }
        ]}
      />
    </Sider>
  );
};

export default App;
