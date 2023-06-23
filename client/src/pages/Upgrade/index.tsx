// React
import React, { FC, useState, useEffect } from 'react'

// Ant
import { Row, Col, Button, List, Space, Tooltip, Alert } from 'antd'

// Stripe
import { loadStripe } from '@stripe/stripe-js'

// Apollo
import { useLazyQuery, useQuery } from '@apollo/client'
import { CHECKOUT, GET_USER } from '../../utils/apollo/queries'

// Custom
import ContentTitle from '../../components/ContentTitle'
import ContentSubtitle from '../../components/ContentSubtitle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

/* Auth */
import Auth from '../../utils/auth'
import { IconName } from '@fortawesome/fontawesome-svg-core'
import NotLoggedIn from '../../components/NotLoggedIn'

// Stripe
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx')

const Upgrade: FC = () => {
  const [getCheckout, { data }] = useLazyQuery(CHECKOUT)
  const {
    data: userData,
    loading: userLoading,
    error: userError
  } = useQuery(GET_USER)

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

  if (!Auth.loggedIn()) return <NotLoggedIn />

  return pro ? (
    <Alert
      type="success"
      message="You are already pro"
    />
  ) : (
    <Col span={24}>
      <Row>
        <ContentTitle>ingré PRO</ContentTitle>
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
                        <FontAwesomeIcon
                          icon={'fa-solid fa-book-open' as IconName}
                          style={{
                            borderRadius: '50%',
                            color: 'black'
                          }}
                        />
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
