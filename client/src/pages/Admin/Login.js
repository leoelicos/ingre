import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { LOGIN } from '../../utils/apollo/mutations';
import Auth from '../../utils/auth';
import { Button, Form, Input, Space, Divider } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContentTitle from '../../components/ContentTitle';
const App = () => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [login, { error }] = useMutation(LOGIN);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log('logging in with ', formState.email, formState.password);
      const mutationResponse = await login({
        variables: {
          email: formState.email,
          password: formState.password
          //
        }
      });
      const token = mutationResponse.data.login.token;
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
      <Link to="/signup">
        <Button type="primary">← Go to Signup</Button>
      </Link>
      <Divider></Divider>
      <ContentTitle>
        <FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-egg" style={{ margin: '0 0.3rem 0 0.6rem', color: 'var(--ingre-eggshell)', fontSize: '1.8rem', paddingBottom: '2px' }} />
        <span style={{ color: 'var(--ingre-dark-brown)', fontFamily: 'Poppins, sans-serif', fontSize: '36px', letterSpacing: -1, fontWeight: '800' }}>ingré Login</span>
      </ContentTitle>
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
