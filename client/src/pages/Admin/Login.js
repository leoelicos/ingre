import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { LOGIN } from '../../utils/apollo/mutations';
import Auth from '../../utils/auth';
import { Button, Form, Input, Space } from 'antd';

const App = () => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [login, { error }] = useMutation(LOGIN);

  const handleFormSubmit = async (event) => {
    console.log('hello');
    event.preventDefault();
    try {
      console.log('logging in with ', formState.email, formState.password);
      const mutationResponse = await login({
        variables: { email: formState.email, password: formState.password }
      });
      console.log('Received mutation response: ', mutationResponse);
      const token = mutationResponse.data.login.token;
      console.log('Received token: ', token);
      Auth.login(token);
    } catch (e) {
      console.log(e);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value
    });
  };

  return (
    <div>
      <Link to="/signup">← Go to Signup</Link>

      <h2>Login</h2>
      <Form
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
        initialValues={{
          remember: true
        }}
        onSubmit={handleFormSubmit}
        autoComplete="off"
        //
      >
        <Form.Item
          rules={[{ required: true, message: 'Please input your email!' }]}
          label="Email"
          //
        >
          <Input
            placeholder="youremail@test.com"
            name="email"
            type="email"
            id="email"
            value={formState.email}
            onChange={handleChange}
            //
          />
        </Form.Item>
        <Form.Item
          label="Password"
          rules={[
            {
              required: true,
              message: 'Please input your password!'
            }
          ]}
        >
          <Input.Password
            name="password"
            value={formState.password}
            onChange={handleChange}
            //
          />
        </Form.Item>

        {error ? (
          <Space>
            <p>The provided credentials are incorrect</p>
          </Space>
        ) : null}

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16
          }}
        >
          <Button type="primary" htmlType="submit" onClick={handleFormSubmit}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default App;
