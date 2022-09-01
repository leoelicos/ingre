// React Router DOM
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// useContext
import { useStoreContext } from '../utils/state/GlobalState';

// Apollo
import { useQuery } from '@apollo/client';
import { GET_NUM_SAVED_RECIPES } from '../utils/apollo/queries';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Ant components
import { Layout, Menu } from 'antd';
import { COLLAPSE_SIDEBAR } from '../utils/state/actions';
import { useEffect } from 'react';

// Ant subcomponent
const { Sider } = Layout;

const App = () => {
  const { loading, error, data, refetch } = useQuery(GET_NUM_SAVED_RECIPES);

  const location = useLocation();
  const { pathname } = location;
  const [state, dispatch] = useStoreContext();
  const getKey = () => {
    if (pathname === '/search') return '2';
    else if (pathname === '/custom') return '3';
    else if (pathname === '/saved') return '4';
    else if (pathname === '/ingredients') return '5';
    else if (pathname === '/tapoff') return '6';
    return '1';
  };

  useEffect(() => {
    refetch();
  });

  return (
    <Sider
      breakpoint="md"
      onBreakpoint={(broken) => {
        console.log(broken);
        dispatch({ type: COLLAPSE_SIDEBAR });
      }}
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
            label: <Link to="/custom">Customise</Link>
          },
          {
            key: 4,
            icon: (
              <Link to="/saved" style={{ minWidth: '19.19px', textAlign: 'center' }}>
                {/*  <FontAwesomeIcon
                  icon="fa-solid fa-floppy-disk"
                  style={{ width: '19.19px' }}
                  //
                /> */}
                <span style={{ minWidth: '22px', color: 'var(--ingre-dark-brown)' }}>{loading || error ? 0 : data.getNumSavedRecipes}</span>
              </Link>
            ),
            label: (
              <Link to="/saved">
                Saved
                {/* <Space>
                  Saved
                  <span style={{ color: 'var(--ingre-dark-brown)' }}>{loading || error ? 0 : data.getNumSavedRecipes}</span>
                </Space> */}
              </Link>
            )
          },
          {
            key: 5,
            icon: (
              <Link to="/ingredients" style={{ width: '19.19px', transform: 'translateX(1px)' }}>
                <FontAwesomeIcon icon="fa-solid fa-egg" />
              </Link>
            ),
            label: <Link to="/ingredients">Ingredients</Link>
          },
          {
            key: 6,
            icon: (
              <Link to="/tapoff">
                <FontAwesomeIcon icon="fa-solid fa-square-check" style={{ width: '19.19px' }} />
              </Link>
            ),
            label: <Link to="/tapoff">Tap Off</Link>
          }
        ]}
      />
    </Sider>
  );
};

export default App;
