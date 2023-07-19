// react
import React, { FC } from 'react'
import { useLocation } from 'react-router-dom'

// state
import { useStoreContext } from '../../../utils/state/GlobalState.tsx'
import { TOGGLE_SIDEBAR } from '../../../utils/state/actions.ts'
import { useAuthContext } from '../../../utils/auth/AuthContext.tsx'

// components
import { Row } from 'antd'
import ToggleMenu from './Left/ToggleMenu.tsx'
import StepSmall from './Middle/StepSmall.tsx'
import StepBig from './Middle/StepBig.tsx'
import AuthButton from './Right/AuthButton.tsx'

const Header: FC = () => {
  const [state, dispatch] = useStoreContext()

  const handleMenuToggle = () => {
    dispatch({ type: TOGGLE_SIDEBAR })
  }

  const { pathname } = useLocation()
  const [authState] = useAuthContext()
  const loggedIn = authState.loggedIn
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
        {/* Left */}
        <ToggleMenu
          collapsed={state.leftSidebarCollapsed}
          onClick={handleMenuToggle}
        />

        {/* Middle - one with responsive display none  */}
        <StepSmall pathname={pathname} />
        <StepBig pathname={pathname} />

        {/* Right */}
        <AuthButton loggedIn={loggedIn} />
      </Row>
    </Row>
  )
}

export default Header
