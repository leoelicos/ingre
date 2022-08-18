import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApolloClient, useMutation } from '@apollo/client';
import Auth from '../../utils/auth';
import { GET_USER_WITH_EMAIL } from '../../utils/apollo/queries.js';
import { ADD_USER } from '../../utils/apollo/mutations.js';

import ContentTitle from '../../components/ContentTitle';
import ContentSubtitle from '../../components/ContentSubtitle';
import Alert from '../../components/Alert';

import { Button, Form, Input, Divider, Space } from 'antd';

const App = () => {
  const [addUser, { error }] = useMutation(ADD_USER);
  const [form] = Form.useForm();

  const client = useApolloClient();

  const userExists = async (email) => {
    console.log(`Validate ${email}`);
    const { data } = await client.query({
      query: GET_USER_WITH_EMAIL,
      variables: { email }
    });
    console.log('data = ', data);
    if (data.getUserWithEmail)
      return Promise.reject(
        <>
          <Alert
            type="warning"
            message={
              <>
                <Space>A user with this email already exists!</Space>
                <Link to="/login">
                  <Button
                    type="default"
                    style={{ width: '100%' }}
                    //
                  >
                    Login?
                  </Button>
                </Link>
              </>
            }
          />
        </>
      );
    return Promise.resolve();
  };

  const handleFormSubmit = async (values) => {
    const { user } = values;
    const { firstName, lastName, email, password } = user;
    const variables = { input: { email, password, firstName, lastName } };
    try {
      console.log('variables = ', variables);
      const res = await addUser({ variables });
      const token = res.data.addUser.token;
      Auth.login(token);
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

  return (
    <div>
      <ContentTitle>Signup</ContentTitle>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        labelAlign="left"
        initialValues={{ remember: true }}
        style={{ maxWidth: '400px' }}
        colon={false}
        onValuesChange={handleChange}
        onFinish={handleFormSubmit}
        //
      >
        <Form.Item
          name={['user', 'firstName']}
          label="First name"
          style={{ marginBottom: '12px' }}
          rules={[
            {
              required: true,
              message: <Alert type="error" message="First name is required" showIcon />
              //
            },
            {
              pattern: new RegExp(/^[^\s]+$/),
              message: <Alert type="error" message="First name cannot contain spaces" showIcon />
              //
            },
            {
              pattern: new RegExp(/^[^!";#$%&'()*+,./:;<=>?@[\]^_{|}~]+$/),
              message: <Alert type="error" message="First name cannot contain symbols" showIcon />
              //
            }

            //
          ]}
          //
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={['user', 'lastName']}
          label="Last name"
          style={{ marginBottom: '12px' }}
          rules={[
            {
              required: true,
              message: <Alert type="error" message="Last name is required" showIcon />
              //
            },
            {
              pattern: new RegExp(/^[^\s]+$/),
              message: <Alert type="error" message="Last name cannot contain spaces" showIcon />
              //
            },
            {
              pattern: new RegExp(/^[^!";#$%&'()*+,./:;<=>?@[\]^_{|}~]+$/),
              message: <Alert type="error" message="Last name cannot contain symbols" showIcon />
              //
            }
            //
          ]}
          //
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
              //
            },
            {
              type: 'email',
              message: <Alert type="error" message="Email must be valid" showIcon />
              //
            },
            { validator: (_, value) => userExists(value) }
            //
          ]}
          style={{ marginBottom: '12px' }}
          //
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
              //
            },
            {
              pattern: new RegExp(/^[A-Za-z]/),
              message: <Alert type="error" message="Password must begin with a letter" showIcon />
              //
            },
            {
              pattern: new RegExp(/\w{8,}/),
              message: <Alert type="error" message="Password must have a minimum of 8 characters" showIcon />
              //
            }
            //
          ]}
          style={{ marginBottom: '12px' }}
          //
        >
          <Input.Password />
        </Form.Item>

        {error && (
          <Form.Item label=" ">
            <Alert message="Couldn't sign you up." />
          </Form.Item>
        )}

        <Form.Item label=" ">
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: '100%' }}
            //
          >
            Submit
          </Button>
        </Form.Item>
        <Divider />
        <Form.Item label=" ">
          <ContentSubtitle>Have an account?</ContentSubtitle>
          <Link to="/login">
            <Button
              type="default"
              style={{ width: '100%' }}
              //
            >
              Login
            </Button>
          </Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default App;
