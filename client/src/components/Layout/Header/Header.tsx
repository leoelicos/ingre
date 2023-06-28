// react
import React, { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'

// state
import { useStoreContext } from '../../../utils/state/GlobalState.tsx'
import { TOGGLE_SIDEBAR } from '../../../utils/state/actions.ts'

// auth
import Auth from '../../../utils/auth/auth.ts'

// components
import { Col, Row, Steps } from 'antd'
import LogoutLink from '../../Authentication/LogoutLink.tsx'
import LoginLink from '../../Authentication/LoginLink.tsx'
import ToggleMenu from './Left/ToggleMenu.tsx'
import {
  IngreIconIngredients,
  IngreIconRecipe,
  IngreIconTapOff
} from '../../Icons/Icon.tsx'

const Header: FC = () => {
  const [state, dispatch] = useStoreContext()

  const handleMenuToggle = () => {
    dispatch({ type: TOGGLE_SIDEBAR })
  }

  const { pathname } = useLocation()
  const getStep =
    pathname === '/tapoff' ? 2 : pathname === '/ingredients' ? 1 : 0

  return (
    <Row
      className="header-row"
      style={{
        width: '100%',
        borderBottom: '1px solid var(--ingre-grey)',
        justifyContent: 'center'
      }}
    >
      <Row
        className="cols"
        style={{
          width: '100%',
          maxWidth: '1264px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Toggle menu */}
        <ToggleMenu
          collapsed={state.leftSidebarCollapsed}
          onClick={handleMenuToggle}
        />
        {/* Step small */}
        <Col
          className="col-steps-sm"
          span={0}
          sm={7}
          md={0}
        >
          <Row
            className="header-row-row-col2-row"
            align="middle"
          >
            <Steps
              className="header-row-row-col2-row-steps"
              size="small"
              current={getStep}
              responsive={false}
            >
              <Steps.Step
                icon={
                  <Link to="/">
                    <IngreIconRecipe />
                  </Link>
                }
              />
              <Steps.Step
                icon={
                  <Link to="/ingredients">
                    <IngreIconIngredients />
                  </Link>
                }
              />
              <Steps.Step
                icon={
                  <Link to="/tapoff">
                    <IngreIconTapOff />
                  </Link>
                }
              />
            </Steps>
          </Row>
        </Col>
        {/* Step big */}
        <Col
          className="col-steps-lg"
          span={0}
          md={11}
        >
          <Row
            className="header-row-row-col2-row"
            align="middle"
          >
            <Steps
              className="header-row-row-col2-row-steps"
              size="small"
              current={getStep}
              responsive={false}
            >
              <Steps.Step
                title={<Link to="/">Recipes</Link>}
                icon={
                  <Link to="/">
                    <IngreIconRecipe />
                  </Link>
                }
              />
              <Steps.Step
                title={<Link to="/ingredients">Ingredients</Link>}
                icon={
                  <Link to="/ingredients">
                    <IngreIconIngredients />
                  </Link>
                }
              />
              <Steps.Step
                title={<Link to="/tapoff">Tap Off</Link>}
                icon={
                  <Link to="/tapoff">
                    <IngreIconTapOff />
                  </Link>
                }
              />
            </Steps>
          </Row>
        </Col>
        {/* Logout/Login/Signup */}
        <Col className="col-auth">
          <Row
            className="header-row-row-col3"
            align="middle"
          >
            {Auth.loggedIn() ? <LogoutLink /> : <LoginLink />}
          </Row>
        </Col>
      </Row>
    </Row>
  )
}

export default Header
