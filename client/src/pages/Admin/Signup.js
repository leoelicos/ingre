import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import Auth from '../../utils/auth';
import { ADD_USER } from '../../utils/apollo/mutations';
import { Button, Form, Input, Space, Divider } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContentTitle from '../../components/ContentTitle';
import { checkPassword, validateEmail } from '../../utils/helpers';

const App = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [formState, setFormState] = useState({ email: '', password: '', firstname: '', lastname: '' });
  const [addUser, { error }] = useMutation(ADD_USER);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!validateEmail(formState.email)) {
      setErrorMessage('Please enter a valid email');
      return;
    }
    if (!checkPassword(formState.password)) {
      setErrorMessage(`Password must start with a letter and be between 8 and 15 characters`);
      return;
    }

    try {
      const mutationResponse = await addUser({
        variables: {
          input: {
            email: formState.email,
            password: formState.password,
            firstName: formState.firstname,
            lastName: formState.lastname
            //
          }
        }
      });
      const token = mutationResponse.data.addUser.token;
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
      <Link to="/login">
        <Button type="primary">← Go to Login</Button>
      </Link>
      <Divider></Divider>
      <ContentTitle>
        <FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-egg" style={{ margin: '0 0.3rem 0 0.6rem', color: 'var(--ingre-eggshell)', fontSize: '1.8rem', paddingBottom: '2px' }} />
        ingré Signup
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
          rules={[{ required: true, message: 'Please input your first name!' }]}
          label="First name"
          //
        >
          <Input
            placeholder="First name"
            name="firstname"
            type="firstname"
            id="firstname"
            value={formState.firstname}
            onChange={handleChange}
            //
          />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input your last name!' }]}
          label="Last name"
          //
        >
          <Input
            placeholder="Last name"
            name="lastname"
            type="lastname"
            id="lastname"
            value={formState.lastname}
            onChange={handleChange}
            //
          />
        </Form.Item>
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
        {errorMessage && (
          <div>
            <p>{errorMessage}</p>
          </div>
        )}
        {error ? (
          <Space>
            <p>A user with this email already exists!</p>
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
