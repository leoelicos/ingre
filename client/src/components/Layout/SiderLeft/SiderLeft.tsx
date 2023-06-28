// react
import React, { FC, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

// state
import { useStoreContext } from '../../../utils/state/GlobalState.tsx'
import { SHOW_DRAWER, COLLAPSE_SIDEBAR } from '../../../utils/state/actions.ts'

// data
import { useQuery } from '@apollo/client'
import { GET_NUM_SAVED_RECIPES } from '../../../utils/apollo/queries.ts'

// components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Menu, Layout } from 'antd'

// authentication
import Auth from '../../../utils/auth/auth.ts'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

const SiderLeft: FC = () => {
  const showDrawer = () => {
    dispatch({ type: SHOW_DRAWER })
  }

  const { loading, error, data, refetch } = useQuery(GET_NUM_SAVED_RECIPES)

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

  useEffect(() => {
    if (Auth.loggedIn()) refetch()
  }, [Auth])

  return (
    <Layout.Sider
      breakpoint="md"
      onBreakpoint={(broken) => {
        if (broken) dispatch({ type: COLLAPSE_SIDEBAR })
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
                  icon={'fa-solid fa-cookie' as IconProp}
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
                  icon={'fa-solid fa-magnifying-glass' as IconProp}
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
                  icon={'fa-solid fa-pen' as IconProp}
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
                  {!Auth.loggedIn() || loading || error
                    ? 0
                    : data.getNumSavedRecipes}
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
                <FontAwesomeIcon icon={'fa-solid fa-egg' as IconProp} />
              </Link>
            ),
            label: <Link to="/ingredients">Ingredients</Link>
          },
          {
            key: 6,
            icon: (
              <Link to="/tapoff">
                <FontAwesomeIcon
                  icon={'fa-solid fa-square-check' as IconProp}
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
                  icon={'fa-solid fa-book-open' as IconProp}
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
                <FontAwesomeIcon
                  icon={'fa-solid fa-circle-info' as IconProp}
                  style={{
                    width: '19.19px'
                  }}
                />
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
