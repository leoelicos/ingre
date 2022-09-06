// React
import { useEffect, useState } from 'react';

// React Router DOM
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// useContext
import { useStoreContext } from '../utils/state/GlobalState';

// useReducer
import { SHOW_DRAWER } from '../utils/state/actions';

// Apollo
import { useQuery } from '@apollo/client';
import { GET_NUM_SAVED_RECIPES } from '../utils/apollo/queries';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Ant components
import { Button, Layout, Menu } from 'antd';
import { COLLAPSE_SIDEBAR, EXPAND_SIDEBAR } from '../utils/state/actions';

// Auth
import Auth from '../../../server/utils/auth';

// Ant subcomponent
const { Sider } = Layout;

const App = () => {
  const showDrawer = () => {
    dispatch({ type: SHOW_DRAWER });
  };

  const { loading, error, data, refetch } = useQuery(GET_NUM_SAVED_RECIPES);

  const location = useLocation();
  const { pathname } = location;
  const [state, dispatch] = useStoreContext();
  const getKey = () => {
    if (pathname === '/search') return '2';
    else if (pathname === '/customise') return '3';
    else if (pathname === '/saved') return '4';
    else if (pathname === '/ingredients') return '5';
    else if (pathname === '/tapoff') return '6';
    else if (pathname === '/upgrade') return '7';
    return '1';
  };

  const [broken, setBroken] = useState(state.leftSidebarCollapsed);
  useEffect(() => {
    refetch();
  });

  useEffect(() => {
    if (broken === true) dispatch({ type: COLLAPSE_SIDEBAR });
    else dispatch({ type: EXPAND_SIDEBAR });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broken]);

  return (
    <Sider
      breakpoint="md"
      onBreakpoint={(broken) => {
        setBroken(broken);
      }}
      trigger={null}
      collapsible
      collapsed={state.leftSidebarCollapsed}
      collapsedWidth="60px"
      style={{
        minWidth: '40px !important'
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
                  style={{
                    width: '19.19px'
                  }}
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
                  style={{
                    width: '19.19px'
                  }}
                />
              </Link>
            ),
            label: <Link to="/search">Search</Link>
          },
          {
            key: 3,
            icon: (
              <Link to="/customise">
                <FontAwesomeIcon
                  icon="fa-solid fa-pen"
                  style={{
                    width: '19.19px'
                  }}
                />
              </Link>
            ),
            label: <Link to="/customise">Customise</Link>
          },
          {
            key: 4,
            icon: (
              <Link
                to="/saved"
                style={{
                  minWidth: '19.19px',
                  textAlign: 'center'
                }}
              >
                <span
                  style={{
                    color: 'var(--ingre-dark-brown)'
                  }}
                >
                  {!Auth.loggedIn() || loading || error ? 0 : data.getNumSavedRecipes}
                </span>
              </Link>
            ),
            label: <Link to="/saved">Saved</Link>
          },
          {
            key: 5,
            icon: (
              <Link
                to="/ingredients"
                style={{
                  width: '19.19px',
                  transform: 'translateX(1px)'
                }}
              >
                <FontAwesomeIcon icon="fa-solid fa-egg" />
              </Link>
            ),
            label: <Link to="/ingredients">Ingredients</Link>
          },
          {
            key: 6,
            icon: (
              <Link to="/tapoff">
                <FontAwesomeIcon
                  icon="fa-solid fa-square-check"
                  style={{
                    width: '19.19px'
                  }}
                />
              </Link>
            ),
            label: <Link to="/tapoff">Tap Off</Link>
          },

          {
            key: 7,
            icon: (
              <Link to="/upgrade">
                <FontAwesomeIcon
                  icon="fa-solid fa-book-open"
                  style={{
                    width: '19.19px'
                  }}
                />
              </Link>
            ),
            label: <Link to="/upgrade">PRO</Link>
          },
          {
            key: 8,
            icon: (
              <Button onClick={showDrawer} style={{ padding: 0, margin: 0, border: 0, background: 'none', boxShadow: 'none' }}>
                <Link to="">
                  <FontAwesomeIcon
                    icon="fa-solid fa-circle-info"
                    style={{
                      width: '19.19px'
                    }}
                  />
                </Link>
              </Button>
            ),
            label: (
              <Button
                onClick={showDrawer}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  padding: 0,
                  margin: 0,
                  border: 0,
                  background: 'none',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'border-color 0.3s, background 0.3s, padding 0.1s cubic-bezier(0.215, 0.61, 0.355, 1)'
                }}
                block
              >
                <Link to="#" className="ant-menu-title-content">
                  Help
                </Link>
              </Button>
            )
          }
        ]}
      />
    </Sider>
  );
};

export default App;
