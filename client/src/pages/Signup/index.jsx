import React, { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useApolloClient, useMutation } from '@apollo/client';
import Auth from '../../utils/auth';
import { GET_USER_WITH_EMAIL } from '../../utils/apollo/queries.js';
import { ADD_USER } from '../../utils/apollo/mutations.js';

import ContentTitle from '../../components/ContentTitle';
import ContentSubtitle from '../../components/ContentSubtitle';
import Alert from '../../components/Alert';

import { Button, Form, Input, Divider, Space, Row, Col } from 'antd';

const App = () => {
  const [addUser, { error }] = useMutation(ADD_USER);
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const client = useApolloClient();

  const userExists = async (email) => {
    // console.log(`[Signup] Validate ${email}`);
    const { data } = await client.query({
      query: GET_USER_WITH_EMAIL,
      variables: { email }
    });
    // console.log('data = ', data);
    if (data.getUserWithEmail)
      return Promise.reject(
        <Alert
          type="error"
          message={
            <Space direction="vertical">
              A user with this email already exists!
              <Link to="/login">
                <Button block={true}>Log in?</Button>
              </Link>
            </Space>
          }
        />
      );
    return Promise.resolve();
  };

  const handleFormSubmit = async (values) => {
    const { user } = values;
    const { firstName, lastName, email, password } = user;
    const variables = { input: { email, password, firstName, lastName } };
    try {
      // console.log('variables = ', variables);
      const res = await addUser({ variables });
      const token = res.data.addUser.token;
      Auth.login(token);

      navigate(-1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (changedValues) => {
    const { firstName, lastName, email, password } = changedValues;
    if (firstName) form.setFieldsValue({ firstName });
    if (lastName) form.setFieldsValue({ lastName });
    if (email) form.setFieldsValue({ email });
    if (password) form.setFieldsValue({ password });
  };

  useEffect(() => {
    document.title = 'Signup';
  }, []);

  return Auth.loggedIn() ? (
    <Navigate to="/" />
  ) : (
    <Col
      style={{
        width: '100%',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center'
      }}
    >
      <Row>
        <ContentTitle>Sign up</ContentTitle>
      </Row>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        labelAlign="right"
        initialValues={{ remember: true }}
        colon={false}
        onValuesChange={handleChange}
        onFinish={handleFormSubmit}
        style={{
          width: '100%',
          marginTop: '1rem',
          maxWidth: '600px'
        }}
      >
        <Form.Item
          name={['user', 'firstName']}
          label="First name"
          style={{
            marginBottom: '12px'
          }}
          rules={[
            {
              required: true,
              message: <Alert type="error" message="First name is required" showIcon />
            },
            {
              pattern: new RegExp(/^[^\s]+$/),
              message: <Alert type="error" message="First name cannot contain spaces" showIcon />
            },
            {
              pattern: new RegExp(/^[^!";#$%&'()*+,./:;<=>?@[\]^_{|}~]+$/),
              message: <Alert type="error" message="First name cannot contain symbols" showIcon />
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={['user', 'lastName']}
          label="Last name"
          style={{
            marginBottom: '12px'
          }}
          rules={[
            {
              required: true,
              message: <Alert type="error" message="Last name is required" showIcon />
            },
            {
              pattern: new RegExp(/^[^\s]+$/),
              message: <Alert type="error" message="Last name cannot contain spaces" showIcon />
            },
            {
              pattern: new RegExp(/^[^!";#$%&'()*+,./:;<=>?@[\]^_{|}~]+$/),
              message: <Alert type="error" message="Last name cannot contain symbols" showIcon />
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={['user', 'email']}
          label="Email"
          rules={[
            {
              required: true,
              message: <Alert type="error" message="Email is required" showIcon />
            },
            {
              type: 'email',
              message: <Alert type="error" message="Email must be valid" showIcon />
            },
            { validator: (_, value) => userExists(value) }
          ]}
          style={{
            marginBottom: '12px'
          }}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={['user', 'password']}
          label="Password"
          rules={[
            {
              required: true,
              message: <Alert type="error" message="Password is required" showIcon />
            },
            {
              pattern: new RegExp(/^[A-Za-z]/),
              message: <Alert type="error" message="Password must begin with a letter" showIcon />
            },
            {
              pattern: new RegExp(/\w{8,}/),
              message: <Alert type="error" message="Password must have a minimum of 8 characters" showIcon />
            }
          ]}
          style={{
            marginBottom: '12px'
          }}
        >
          <Input.Password />
        </Form.Item>

        {error && (
          <Form.Item label=" ">
            <Alert type="error" message="Couldn't sign you up." />
          </Form.Item>
        )}

        <Form.Item label=" ">
          <Button
            type="primary"
            htmlType="submit"
            block
            //
          >
            Submit
          </Button>
        </Form.Item>
        <Divider />
        <Form.Item label=" ">
          <ContentSubtitle>Have an account?</ContentSubtitle>
          <Link to="/login">
            <Button type="ghost" block={true}>
              Login
            </Button>
          </Link>
        </Form.Item>
      </Form>
    </Col>
  );
};

export default App;
