import { Row } from 'antd'
import React, { FC } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthContext } from '../../../utils/auth/AuthContext.tsx'
import { useStoreContext } from '../../../utils/state/GlobalState.tsx'
import { TOGGLE_SIDEBAR } from '../../../utils/state/actions.ts'
import ToggleMenu from './Left/ToggleMenu.tsx'
import ResponsiveSteps from './Middle/ResponsiveSteps.tsx'
import { stepDict } from './Middle/stepDict.ts'
import AuthButton from './Right/AuthButton.tsx'

const Header: FC = () => {
  const [state, dispatch] = useStoreContext()

  const handleMenuToggle = () => {
    dispatch({ type: TOGGLE_SIDEBAR })
  }

  const { pathname } = useLocation()
  const step = stepDict[pathname] === undefined ? 0 : stepDict[pathname]
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn
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
        <ResponsiveSteps step={step} />

        {/* Right */}
        <AuthButton loggedIn={loggedIn} />
      </Row>
    </Row>
  )
}

export default Header
