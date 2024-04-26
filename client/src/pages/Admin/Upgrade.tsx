import { useLazyQuery, useQuery } from '@apollo/client'
import { loadStripe } from '@stripe/stripe-js'
import { Alert, Button, Col, List, Row, Space, Tooltip } from 'antd'
import React, { FC, useEffect, useState } from 'react'
import NotLoggedIn from '../../components/Layout/NotLoggedIn.tsx'
import ContentSubtitle from '../../components/Text/ContentSubtitle.tsx'
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import { CHECKOUT, GET_USER } from '../../lib/apollo/graphQL/queries.ts'
import { IngreIconPro } from '../../lib/icon/Icon.tsx'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx')

const AlreadyPro = () => (
  <Alert
    type="success"
    message="You are already pro"
  />
)

const Upgrade: FC = () => {
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn

  const [getCheckout, { data }] = useLazyQuery(CHECKOUT)
  const {
    data: userData,
    loading: userLoading,
    error: userError
  } = useQuery(GET_USER) // TODO why is this needed? We already have this information from token

  const [pro, setPro] = useState(false)

  useEffect(() => {
    if (data) {
      stripePromise.then((res) => {
        if (!res) {
          console.error('Error: No response from Stripe')
          return
        }
        res.redirectToCheckout({ sessionId: data.checkout.session })
      })
    }
  }, [data])

  useEffect(() => {
    if (!userLoading && !userError && userData?.getUser) {
      // console.log('userData', userData);
      setPro(userData.getUser.pro)
    }
  }, [userLoading, userError, userData])

  if (pro) return <AlreadyPro />

  if (!loggedIn)
    return (
      <Col span={24}>
        <Row>
          <ContentTitle>Upgrade</ContentTitle>
        </Row>
        <NotLoggedIn />
      </Col>
    )

  return (
    <Col span={24}>
      <Row>
        <ContentTitle>Upgrade</ContentTitle>
      </Row>
      <Row>
        <Space direction="vertical">
          <ContentSubtitle>Why upgrade?</ContentSubtitle>
          <List>
            <List.Item>
              <Space direction="vertical">
                Get an extra button that opens cooking instructions for each
                recipe
                <Space>
                  Try it out!
                  <Tooltip
                    color="volcano"
                    placement="top"
                    title={<Space size="small">Cooking instructions</Space>}
                  >
                    <Button
                      key="removeButton"
                      style={{
                        borderRadius: '50%',
                        padding: '4px 7px'
                      }}
                      shape="circle"
                    >
                      <a
                        href={
                          'https://www.edamam.com/results/recipe/?recipe=healthy-persian-love-cake-recipe-1d81f64f756c268979d9c863403b32d3/-'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IngreIconPro />
                      </a>
                    </Button>
                  </Tooltip>
                </Space>
              </Space>
            </List.Item>
            <List.Item>Only 5 USD</List.Item>
            <List.Item>Secure payment with Stripe</List.Item>
          </List>
        </Space>
      </Row>
      <Row style={{ marginTop: '1rem' }}>
        <Button
          type="primary"
          onClick={() => getCheckout()}
          block
          shape="round"
        >
          Checkout with Stripe
        </Button>
      </Row>
    </Col>
  )
}

export default Upgrade
