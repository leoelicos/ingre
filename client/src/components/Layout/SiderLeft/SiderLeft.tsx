// react
import React, { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'

// state
import { useStoreContext } from '../../../utils/state/GlobalState.tsx'
import { SHOW_DRAWER, COLLAPSE_SIDEBAR } from '../../../utils/state/actions.ts'

// components
import { Menu, Layout } from 'antd'
import {
  IngreIconCustomise,
  IngreIconHelp,
  IngreIconIngredients,
  IngreIconPro,
  IngreIconRecipe,
  IngreIconSearch,
  IngreIconTapOff
} from '../../../lib/icon/Icon.tsx'

const SiderLeft: FC = () => {
  const showDrawer = () => {
    dispatch({ type: SHOW_DRAWER })
  }

  const location = useLocation()
  const { pathname } = location
  const [state, dispatch] = useStoreContext()
  const getKey = () => {
    if (pathname === '/') return '1'
    if (pathname === '/search') return '2'
    else if (pathname === '/customise') return '3'
    else if (pathname === '/saved') return '4'
    else if (pathname === '/ingredients') return '5'
    else if (pathname === '/tapoff') return '6'
    else if (pathname === '/upgrade') return '7'
    return '8'
  }

  return (
    <Layout.Sider
      breakpoint="md"
      onBreakpoint={(broken) => {
        if (broken) dispatch({ type: COLLAPSE_SIDEBAR })
      }}
      trigger={null}
      collapsible={true}
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
                <IngreIconRecipe />
              </Link>
            ),
            label: <Link to="/">Recipes</Link>
          },
          {
            key: 2,
            icon: (
              <Link to="/search">
                <IngreIconSearch />
              </Link>
            ),
            label: <Link to="/search">Search</Link>
          },
          {
            key: 3,
            icon: (
              <Link to="/customise">
                <IngreIconCustomise />
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
                  {state.savedRecipes.length}
                </span>
              </Link>
            ),
            label: <Link to="/saved">Saved</Link>
          },
          {
            key: 5,
            icon: (
              <Link to="/ingredients">
                <IngreIconIngredients />
              </Link>
            ),
            label: <Link to="/ingredients">Ingredients</Link>
          },
          {
            key: 6,
            icon: (
              <Link to="/tapoff">
                <IngreIconTapOff />
              </Link>
            ),
            label: <Link to="/tapoff">Tap Off</Link>
          },

          {
            key: 7,
            icon: (
              <Link to="/upgrade">
                <IngreIconPro />
              </Link>
            ),
            label: <Link to="/upgrade">PRO</Link>
          },
          {
            key: 8,
            icon: (
              <div
                onClick={showDrawer}
                style={{
                  position: 'absolute',
                  left: '0',
                  right: '0',
                  top: '0',
                  bottom: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IngreIconHelp />
              </div>
            ),
            label: <div onClick={showDrawer}>Help</div>
          }
        ]}
      />
    </Layout.Sider>
  )
}

export default SiderLeft
