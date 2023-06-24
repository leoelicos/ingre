// react
import { Link, useLocation, useNavigate } from 'react-router-dom'

// state
import { useStoreContext } from '../../../utils/state/GlobalState.tsx'
import { TOGGLE_SIDEBAR } from '../../../utils/state/actions.ts'

// auth
import Auth from '../../../utils/auth/auth.ts'

// components
import { Col, Row, Button, Steps, Typography } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Header = () => {
  const [state, dispatch] = useStoreContext()

  const handleMenuToggle = () => {
    dispatch({ type: TOGGLE_SIDEBAR })
  }

  const { pathname } = useLocation()
  const getStep =
    pathname === '/tapoff' ? 2 : pathname === '/ingredients' ? 1 : 0
  const navigate = useNavigate()

  const logout = (event) => {
    event.preventDefault()
    Auth.logout()
    navigate(0)
  }

  return (
    <Row
      style={{
        width: '100%',
        borderBottom: '1px solid var(--ingre-grey)',
        justifyContent: 'center'
      }}
    >
      <Row
        style={{
          width: '100%',
          maxWidth: '1264px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Toggle menu */}
        <Col>
          <Row
            align="middle"
            style={{ marginTop: '-1px', paddingBottom: '2px' }}
          >
            {state.leftSidebarCollapsed ? (
              <MenuUnfoldOutlined
                onClick={handleMenuToggle}
                style={{
                  color: 'var(--ingre-dark-brown)',
                  fontSize: '1.2rem',
                  margin: '0 1.2rem'
                }}
              />
            ) : (
              <MenuFoldOutlined
                onClick={handleMenuToggle}
                style={{
                  color: 'var(--ingre-dark-brown)',
                  fontSize: '1.2rem',
                  margin: '0 1.2rem'
                }}
              />
            )}

            <Link to="/">
              <Typography.Title style={{ marginBottom: 0 }}>
                <FontAwesomeIcon
                  className="ingre-logo"
                  icon="fa-solid fa-egg"
                  style={{
                    marginRight: '0.3rem',
                    color: 'var(--ingre-eggshell)',
                    fontSize: '1.8rem',
                    paddingBottom: '2px'
                  }}
                />
                <span
                  style={{
                    color: 'var(--ingre-dark-brown)',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '36px',
                    letterSpacing: -1,
                    fontWeight: '800'
                  }}
                >
                  ingré
                </span>
              </Typography.Title>
            </Link>
          </Row>
        </Col>
        {/* Step small */}
        <Col
          span={0}
          sm={7}
          md={0}
        >
          <Row align="middle">
            <Steps
              size="small"
              current={getStep}
              responsive={false}
            >
              <Steps.Step
                icon={
                  <Link to="/">
                    <FontAwesomeIcon icon="fa-solid fa-cookie" />
                  </Link>
                }
              />
              <Steps.Step
                icon={
                  <Link to="/ingredients">
                    <FontAwesomeIcon icon="fa-solid fa-egg" />
                  </Link>
                }
              />
              <Steps.Step
                icon={
                  <Link to="/tapoff">
                    <FontAwesomeIcon icon="fa-solid fa-square-check" />
                  </Link>
                }
              />
            </Steps>
          </Row>
        </Col>
        {/* Step big */}
        <Col
          span={0}
          md={11}
        >
          <Row align="middle">
            <Steps
              size="small"
              current={getStep}
              responsive={false}
            >
              <Steps.Step
                title={<Link to="/">Recipes</Link>}
                icon={
                  <Link to="/">
                    <FontAwesomeIcon icon="fa-solid fa-cookie" />
                  </Link>
                }
              />
              <Steps.Step
                title={<Link to="/ingredients">Ingredients</Link>}
                icon={
                  <Link to="/ingredients">
                    <FontAwesomeIcon icon="fa-solid fa-egg" />
                  </Link>
                }
              />
              <Steps.Step
                title={<Link to="/tapoff">Tap Off</Link>}
                icon={
                  <Link to="/tapoff">
                    <FontAwesomeIcon icon="fa-solid fa-square-check" />
                  </Link>
                }
              />
            </Steps>
          </Row>
        </Col>
        {/* Logout/Login/Signup */}
        <Col>
          <Row align="middle">
            {Auth.loggedIn() ? (
              <Button
                type="link"
                onClick={logout}
                style={{
                  color: 'var(--ingre-dark-brown)',
                  fontSize: '1.2rem',
                  margin: '0 1.2rem',
                  padding: '0 8px',
                  borderRadius: '1.2rem'
                }}
              >
                Log out
              </Button>
            ) : (
              <Link to="/login">
                <Button
                  type="link"
                  style={{
                    color: 'var(--ingre-dark-brown)',
                    fontSize: '1.2rem',
                    margin: '0 1.2rem',
                    padding: '0 12px',
                    borderRadius: '1.2rem'
                  }}
                  shape="round"
                >
                  Log in
                </Button>
              </Link>
            )}
          </Row>
        </Col>
      </Row>
    </Row>
  )
}

export default Header
