import { Drawer } from 'antd'
import React, { FC, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthContext } from '../../../utils/auth/AuthContext.tsx'
import { useStoreContext } from '../../../utils/state/GlobalState.tsx'
import { HIDE_DRAWER } from '../../../utils/state/actions.ts'
import {
  TimelineCustomise,
  TimelineIngredients,
  TimelineInvalid,
  TimelineLogin,
  TimelineRoot,
  TimelineSaved,
  TimelineSearch,
  TimelineSignup,
  TimelineTapoff,
  TimelineUpgrade
} from './Timelines/index.tsx'

const Timeline: FC = () => {
  const { pathname } = useLocation()

  const [auth] = useAuthContext()
  const pro = !!auth.profile?.data.pro

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
