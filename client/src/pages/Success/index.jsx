// React
import { useEffect } from 'react';

// React Router DOM
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

// ApolloClient
import { useMutation } from '@apollo/client';
import { MAKE_USER_PRO } from '../../utils/apollo/mutations';
import { Alert, Button, Col, Divider, Empty, Row, Space } from 'antd';

import { Typography } from 'antd';

import Auth from '../../utils/auth/index.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const { Title } = Typography;

function Success() {
  const [makeUserPro] = useMutation(MAKE_USER_PRO);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const Token = () => {
    const params = searchParams.get('session_id');

    console.log('params', params);
    return null;
  };

  useEffect(() => {
    async function saveOrder() {
      try {
        const product = { membership: 'PRO' };

        await makeUserPro({ variables: { product } });

        setTimeout(() => {
          navigate('/upgrade');
        }, 3000);
      } catch (e) {
        console.error(e);
      }
    }

    saveOrder();
  }, [makeUserPro, navigate]);

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

  if (!searchParams.get('session_id')) {
    return (
      <Col>
        <Row>
          <Alert message="Payment error" type="error" />
        </Row>
        <Row>
          <Button type="primary" shape="round" block>
            <Link to="/upgrade">
              <FontAwesomeIcon
                icon="fa-solid fa-book-open"
                style={{
                  width: '19.19px'
                }}
              />
              Try again?
            </Link>
          </Button>
        </Row>
      </Col>
    );
  }
  return (
    <Row>
      <Space direction="vertical">
        <Title level={1}>Success!{<Token />}</Title>
        <Title level={2}>Thank you for your purchase!</Title>
        <Title level={3}>You will now be redirected to the home page.</Title>
      </Space>
    </Row>
  );
}

export default Success;
