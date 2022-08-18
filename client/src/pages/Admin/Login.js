import React, { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { LOGIN } from '../../utils/apollo/mutations.js';
import Auth from '../../utils/auth.js';

import ContentTitle from '../../components/ContentTitle';
import ContentSubtitle from '../../components/ContentSubtitle';
import Alert from '../../components/Alert';
import { Button, Form, Input, Divider } from 'antd';

const App = () => {
  const [login, { error }] = useMutation(LOGIN);
  const [form] = Form.useForm();

  const handleFormSubmit = async (values) => {
    const { user } = values;
    const { email, password } = user;
    const variables = { input: { email, password } };
    try {
      console.log('variables = ', variables);
      const res = await login({ variables });
      const token = res.data.login.token;
      Auth.login(token);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (changedValues) => {
    const { email, password } = changedValues;
    if (email) form.setFieldsValue({ email });
    if (password) form.setFieldsValue({ password });
  };

  useEffect(() => {
    document.title = 'Login';
  }, []);

  return (
    <div>
      <ContentTitle>Login</ContentTitle>
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
          name={['user', 'email']}
          label="Email"
          style={{ marginBottom: '12px' }}
          rules={[
            {
              required: true,
              message: <Alert type="warning" message="Please input your email!" />
              //
            }
            //
          ]}
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
              message: <Alert type="warning" message="Please input your password!" />
              //
            }
          ]}
          style={{ marginBottom: '12px' }}
          //
        >
          <Input.Password />
        </Form.Item>

        {error && (
          <Form.Item label=" ">
            <Alert message="Couldn't log you in." type="error" />
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
          <ContentSubtitle>No account?</ContentSubtitle>
          <Link to="/signup">
            <Button
              type="default"
              style={{ width: '100%' }}
              //
            >
              Signup
            </Button>
          </Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default App;
