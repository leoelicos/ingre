// React hooks
import { useEffect } from 'react';

// Ant components
import { Row, Col, Button, List, Space, Tooltip, Empty, Alert, Divider } from 'antd';

// Stripe
import { loadStripe } from '@stripe/stripe-js';

// Apollo
import { useLazyQuery } from '@apollo/client';
import { CHECKOUT } from '../../utils/apollo/queries';

// Custom components
import ContentTitle from '../../components/ContentTitle';
import ContentSubtitle from '../../components/ContentSubtitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Auth from '../../utils/auth';
import { Link } from 'react-router-dom';

// Stripe
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const App = () => {
  const [getCheckout, { data }] = useLazyQuery(CHECKOUT);

  useEffect(() => {
    if (data) {
      stripePromise.then((res) => {
        res.redirectToCheckout({ sessionId: data.checkout.session });
      });
    }
  }, [data]);

  if (!Auth.loggedIn())
    return (
      <Empty>
        <Divider />
        <Row>You need to be logged in to see this page.</Row>
        <Link to="/login">
          <Button type="primary" style={{ marginTop: '1rem' }}>
            Log in
          </Button>
        </Link>
      </Empty>
    );
  return Auth.getProfile()?.data?.pro ? (
    <Alert type="success" message="You are already pro" />
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
                Get an extra button that opens cooking instructions for each recipe
                <Space>
                  Try it out!
                  <Tooltip color="volcano" placement="right" title={<Space size="small">Cooking instructions</Space>}>
                    <Button
                      key="removeButton"
                      style={{
                        borderRadius: '50%',
                        padding: '4px 7px'
                      }}
                      shape="circle"
                    >
                      <a href={'https://www.edamam.com/results/recipe/?recipe=healthy-persian-love-cake-recipe-1d81f64f756c268979d9c863403b32d3/-'} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon
                          icon="fa-solid fa-book-open"
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
        <Button type="primary" onClick={() => getCheckout()} block shape="round">
          Checkout with Stripe
        </Button>
      </Row>
    </Col>
  );
};

export default App;
