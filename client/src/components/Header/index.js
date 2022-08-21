// react
import { useStoreContext } from '../../utils/state/GlobalState';
import { Link, useLocation } from 'react-router-dom';
import Auth from '../../utils/auth';
// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// state
import { SHOW_MODAL, TOGGLE_SIDEBAR } from '../../utils/state/actions';

// components
import ModalGuide from './ModalGuide/index';

// Ant Design
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Col, Row, Button, Steps, Typography } from 'antd';
const { Step } = Steps;
const { Title } = Typography;

const App = () => {
  const [state, dispatch] = useStoreContext();

  const handleMenuToggle = () => {
    dispatch({ type: TOGGLE_SIDEBAR });
  };

  const showModal = () => {
    dispatch({ type: SHOW_MODAL });
  };

  const { pathname } = useLocation();
  const getStep = pathname === '/tapoff' ? 2 : pathname === '/shoppinglist' ? 1 : 0;

  const logout = (event) => {
    event.preventDefault();
    Auth.logout();
  };

  return (
    <>
      <Row align="middle" style={{ borderBottom: '1px solid var(--ingre-grey)', paddingBottom: '2px' }}>
        <Col span={12} sm={8} md={6} style={{ width: '1.2rem' }}>
          <Row align="middle" style={{ marginTop: '-1px', paddingBottom: '2px' }}>
            {state.leftSidebarCollapsed ? (
              //
              <MenuUnfoldOutlined onClick={handleMenuToggle} style={{ color: 'var(--ingre-dark-brown', fontSize: '1.2rem', marginLeft: '1rem' }} />
            ) : (
              <MenuFoldOutlined onClick={handleMenuToggle} style={{ color: 'var(--ingre-dark-brown', fontSize: '1.2rem', marginLeft: '1rem' }} />
            )}

            <Link to="/">
              <Title style={{ marginBottom: 0 }}>
                <FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-egg" style={{ margin: '0 0.3rem 0 0.6rem', color: 'var(--ingre-eggshell)', fontSize: '1.8rem', paddingBottom: '2px' }} />
                <span style={{ color: 'var(--ingre-dark-brown)', fontFamily: 'Poppins, sans-serif', fontSize: '36px', letterSpacing: -1, fontWeight: '800' }}>ingré</span>
              </Title>
            </Link>
          </Row>
        </Col>
        <Col span={0} sm={7} md={0}>
          <Row align="middle">
            <Steps size="small" current={getStep} responsive={false}>
              <Step
                icon={
                  <Link to="/">
                    <FontAwesomeIcon icon="fa-solid fa-egg" />
                  </Link>
                }
              />
              <Step
                icon={
                  <Link to="/shoppinglist">
                    <FontAwesomeIcon icon="fa-solid fa-cart-shopping" />
                  </Link>
                }
              />
              <Step
                icon={
                  <Link to="/tapoff">
                    <FontAwesomeIcon icon="fa-solid fa-square-check" />
                  </Link>
                }
              />
            </Steps>
          </Row>
        </Col>
        <Col span={0} md={11}>
          <Row align="middle">
            <Steps size="small" current={getStep} responsive={false}>
              <Step
                title={<Link to="/">Recipes</Link>}
                icon={
                  <Link to="/">
                    <FontAwesomeIcon icon="fa-solid fa-egg" />
                  </Link>
                }
              />
              <Step
                title={<Link to="/shoppinglist">Ingredients</Link>}
                icon={
                  <Link to="/shoppinglist">
                    <FontAwesomeIcon icon="fa-solid fa-cart-shopping" />
                  </Link>
                }
              />
              <Step
                title={<Link to="/tapoff">Tap</Link>}
                icon={
                  <Link to="/tapoff">
                    <FontAwesomeIcon icon="fa-solid fa-square-check" />
                  </Link>
                }
              />
            </Steps>
          </Row>
        </Col>
        <Col span={12} sm={9} md={7}>
          <Row align="bottom" justify="end">
            {Auth.loggedIn() ? (
              <>
                <Button onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button>Login</Button>
                </Link>
                <Link to="/signup">
                  <Button>Signup</Button>
                </Link>
              </>
            )}
            <Button onClick={showModal} style={{ margin: '0 0.3rem' }}>
              <FontAwesomeIcon icon="fa-solid fa-circle-info" />
            </Button>
          </Row>
        </Col>
      </Row>
      <ModalGuide />
    </>
  );
};

export default App;
