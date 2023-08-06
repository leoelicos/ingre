/* react */
import React, { FC, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

/* state */
import { useStoreContext } from '../../../utils/state/GlobalState.tsx'
import { HIDE_DRAWER } from '../../../utils/state/actions.ts'
import { useAuthContext } from '../../../utils/auth/AuthContext.tsx'

/* components */
import { Drawer } from 'antd'
import TimelineRoot from './Timelines/TimelineRoot.tsx'
import TimelineSearch from './Timelines/TimelineSearch.tsx'
import TimelineCustomise from './Timelines/TimelineCustomise.tsx'
import TimelineSaved from './Timelines/TimelineSaved.tsx'
import TimelineIngredients from './Timelines/TimelineIngredients.tsx'
import TimelineTapoff from './Timelines/TimelineTapoff.tsx'
import TimelineLogin from './Timelines/TimelineLogin.tsx'
import TimelineSignup from './Timelines/TimelineSignup.tsx'
import TimelineUpgrade from './Timelines/TimelineUpgrade.tsx'
import TimelineInvalid from './Timelines/TimelineInvalid.tsx'

const Timeline: FC = () => {
  const { pathname } = useLocation()

  const [authState] = useAuthContext()
  const pro = !!authState.profile?.data.pro

  const TimelineCompnent = useMemo(
    () =>
      pathname === '/' ? (
        <TimelineRoot />
      ) : pathname === '/search' ? (
        <TimelineSearch />
      ) : pathname === '/customise' ? (
        <TimelineCustomise />
      ) : pathname === '/saved' ? (
        <TimelineSaved />
      ) : pathname === '/ingredients' ? (
        <TimelineIngredients />
      ) : pathname === '/tapoff' ? (
        <TimelineTapoff />
      ) : pathname === '/login' ? (
        <TimelineLogin />
      ) : pathname === '/signup' ? (
        <TimelineSignup />
      ) : pathname === '/upgrade' ? (
        <TimelineUpgrade pro={pro} />
      ) : (
        <TimelineInvalid />
      ),
    [pathname, pro]
  )
  return TimelineCompnent
}

const HelpDrawer = () => {
  const [state, dispatch] = useStoreContext()
  const handleOk = () => dispatch({ type: HIDE_DRAWER })
  return (
    <Drawer
      visible={state.modalVisible}
      placement="right"
      onClose={handleOk}
      closable={true}
      maskStyle={{
        background: 'rgba(0,0,0,0.2)'
      }}
    >
      <Timeline />
    </Drawer>
  )
}

export default HelpDrawer
