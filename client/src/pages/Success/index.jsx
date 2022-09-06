// React
import { useEffect } from 'react';

// React Router DOM
import { Link, useNavigate } from 'react-router-dom';

// ApolloClient
import { useMutation } from '@apollo/client';
import { MAKE_USER_PRO } from '../../utils/apollo/mutations';
import { Alert, Button, Divider, Empty, Row, Space } from 'antd';

import { Typography } from 'antd';

// login to update token with pro status

import { LOGIN } from '../../utils/apollo/mutations.js';
import Auth from '../../utils/auth/index.js';

const { Title } = Typography;

function Success() {
  const [makeUserPro] = useMutation(MAKE_USER_PRO);
  const navigate = useNavigate();

  const [login, { error }] = useMutation(LOGIN);

  useEffect(() => {
    async function saveOrder() {
      try {
        const product = { membership: 'PRO' };

        const { data } = await makeUserPro({ variables: { product } });
        const productData = data.addOrder;
        console.log('productData', productData);

        // need to login again
        const { email, password } = Auth.getProfile()?.data;
        const payload = { email, password };
        const res = await login({ variables: payload });
        const token = res.data.login.token;
        console.log('localstorage token', token);
        Auth.login(token);

        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (e) {
        console.error(e);
      }
    }

    saveOrder();
  }, [login, makeUserPro, navigate]);

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

  return error ? (
    <Alert message={<Space>{JSON.stringify(error)}"Couldn't make you PRO. Please email admin@ingre.com for assistance."</Space>} type="error" />
  ) : (
    <Row>
      <Space direction="vertical">
        <Title level={1}>Success!</Title>
        <Title level={2}>Thank you for your purchase!</Title>
        <Title level={3}>You will now be redirected to the home page.</Title>
      </Space>
    </Row>
  );
}

export default Success;
