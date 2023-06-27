// React hooks
import React, { FC, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

// components
import { Alert, Button, Drawer as AntDrawer, Space, Timeline } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

// state
import { useStoreContext } from '../../utils/state/GlobalState.tsx'
import { HIDE_DRAWER } from '../../utils/state/actions.ts'

// auth
import Auth from '../../utils/auth/auth.ts'

// components
const { Item } = Timeline

const Drawer: FC = () => {
  const [state, dispatch] = useStoreContext()
  const handleOk = () => dispatch({ type: HIDE_DRAWER })
  const { pathname } = useLocation()
  const pro = Auth.getProfile()?.data?.pro

  const memoPathName = useMemo(() => pathname, [pathname])
  const getDrawerText = useCallback(
    (pathname: string) => {
      switch (pathname) {
        case '/':
          return (
            <Timeline>
              <Item color="green">
                <Space
                  direction="vertical"
                  className="explore-buttons"
                >
                  Explore recipes from your phone. Click
                  <Button>Random</Button>
                  or one of the popular options, or
                  <Button type="primary">
                    <Space>
                      <FontAwesomeIcon
                        icon={'fa-solid fa-magnifying-glass' as IconProp}
                      />
                      &nbsp;Search
                    </Space>
                  </Button>
                  to find your own.
                </Space>
              </Item>
              <Item>
                <Space direction="vertical">
                  Like a recipe? Save it!
                  <Button style={{ borderRadius: '50%', padding: '4px 8px' }}>
                    <FontAwesomeIcon icon={'fa-solid fa-pen' as IconProp} />
                  </Button>
                </Space>
              </Item>
              <Item>
                Don&apos;t like it? Customise it{' '}
                {<FontAwesomeIcon icon={'fa-solid fa-pen' as IconProp} />} it!
              </Item>
            </Timeline>
          )
        case '/search':
          return (
            <Timeline>
              <Item color="green">Search from 2 million tested recipes. </Item>
              <Item color="blue">
                Enter a search term and click{' '}
                {
                  <FontAwesomeIcon
                    icon={'fa-solid fa-magnifying-glass' as IconProp}
                  />
                }{' '}
                or type Enter.{' '}
              </Item>
              <Item color="red">
                To clear search, click{' '}
                {
                  <FontAwesomeIcon
                    icon={'fa-solid fa-circle-xmark' as IconProp}
                  />
                }
                .
              </Item>
              <Item>
                To narrow your search, select from our many filters available.
              </Item>
              <Item>
                Like a recipe? Click&nbsp;
                <FontAwesomeIcon icon={'fa-solid fa-save' as IconProp} />
                &nbsp;to add it to your Saved list.
              </Item>
              <Item>
                You can also&nbsp;
                <FontAwesomeIcon icon={'fa-solid fa-pen' as IconProp} />
                &nbsp;customise them!
              </Item>
            </Timeline>
          )

        case '/customise':
          return (
            <Timeline>
              <Item color="green">Make it your own.</Item>
              <Item>Customise a recipe, or Reset to start again! </Item>
              <Item color="blue">
                To edit recipe name, click on the box to type.
              </Item>
              <Item color="blue">
                For servings and quantities, enter a number or a decimal.
              </Item>
              <Item color="blue">
                To add a new ingredient, click on&nbsp;
                <FontAwesomeIcon icon={'fa-solid fa-add' as IconProp} />
                &nbsp;.
              </Item>
              <Item color="red">
                To delete an existing ingredient, click on&nbsp;
                <FontAwesomeIcon icon={'fa-solid fa-trash' as IconProp} />.
              </Item>
            </Timeline>
          )

        case '/saved':
          return (
            <Timeline>
              <Item color="green">
                Your saved recipes are stored here for 24 hours
              </Item>
              <Item>All your recipes in one place!</Item>
              <Item color="blue">
                Click {<FontAwesomeIcon icon={'fa-solid fa-pen' as IconProp} />}{' '}
                to edit recipes.
              </Item>
              <Item color="blue">
                Click{' '}
                {<FontAwesomeIcon icon={'fa-solid fa-trash' as IconProp} />} to
                remove recipes.
              </Item>
              <Item color="red">
                Your recipes will be deleted after 24 hours.
              </Item>
              <Item color="blue">
                Upgrade to&nbsp;
                <FontAwesomeIcon
                  icon={'fa-solid fa-cubes-stacked' as IconProp}
                />{' '}
                PRO for $5 to save recipes permanently.
              </Item>
            </Timeline>
          )

        case '/ingredients':
          return (
            <Timeline>
              <Item color="green">The final edit!</Item>
              <Item>
                Have you checked your fridge? Is it in season? Edit away!
              </Item>
              <Item color="blue">
                Click&nbsp;
                <FontAwesomeIcon icon={'fa-solid fa-add' as IconProp} />
                &nbsp;to add a new ingredient.
              </Item>
              <Item color="red">
                Click&nbsp;
                <FontAwesomeIcon icon={'fa-solid fa-trash' as IconProp} />
                &nbsp;to remove an ingredient.
              </Item>
              <Item>There is a Misc section for additional groceries!</Item>
            </Timeline>
          )

        case '/tapoff':
          return (
            <Timeline>
              <Item color="green">
                Tap off each ingredient as you shop in the supermarket.
              </Item>
              <Item color="blue">
                Good luck! When you&apos;re done, click &apos;All done&apos; to
                clear your Saved recipes and Shopping list.
              </Item>
            </Timeline>
          )

        case '/login':
          return (
            <Timeline>
              <Item color="green">Log in to start saving recipes!</Item>
            </Timeline>
          )
        case '/signup':
          return (
            <Timeline>
              <Item color="green">Sign up to start saving recipes!</Item>
            </Timeline>
          )

        case '/upgrade':
          return pro ? (
            <Timeline>
              <Item color="green">
                <Alert
                  type="success"
                  message="You are already PRO!"
                />
              </Item>
            </Timeline>
          ) : (
            <Timeline>
              <Item color="green"> How to upgrade to ingré PRO</Item>
              <Item color="blue">
                <Space direction="vertical">
                  Click
                  <Button
                    type="primary"
                    shape="round"
                  >
                    Checkout with Stripe
                  </Button>
                </Space>
              </Item>
              <Item color="blue">
                You will be redirected to Stripe&apos;s POS.
              </Item>
              <Item color="blue">Pay with Stripe.</Item>
              <Item color="green">You will be redirected back to ingré.</Item>
            </Timeline>
          )

        default:
          return (
            <Timeline>
              <Item color="green">
                Please check that you are on a valid page.
              </Item>
            </Timeline>
          )
      }
    },
    [pro]
  )

  const drawerText = getDrawerText(memoPathName)
  return (
    <AntDrawer
      visible={state.modalVisible}
      placement="right"
      onClose={handleOk}
      closable={true}
      maskStyle={{
        background: 'rgba(0,0,0,0.2)'
      }}
    >
      {drawerText}
    </AntDrawer>
  )
}

export default Drawer
