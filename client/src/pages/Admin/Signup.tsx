/* react */
import React, { FC } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

/* state */
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

/* components */
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import ContentSubtitle from '../../components/Text/ContentSubtitle.tsx'
import { Button, Form, Input, Divider, Space, Row, Col, Alert } from 'antd'

/* utils */
import { changeTitle } from '../../utils/changeTitle.ts'
import LoginLink from '../../components/Authentication/LoginLink.tsx'

/* data */
import { useMutation, useLazyQuery } from '@apollo/client'

import { ADD_USER } from '../../lib/apollo/graphQL/mutations.ts'
import { CHECK_EMAIL_ALREADY_EXISTS } from '../../lib/apollo/graphQL/queries.ts'

/* types */
interface UserInterface {
  firstName: string
  lastName: string
  email: string
  password: string
}
interface SignupFormInterface {
  user: UserInterface
}

const colWrapper = {
  width: '100%',
  display: 'flex',
  flexFlow: 'column nowrap',
  alignItems: 'center'
}

const formStyle = {
  width: '100%',
  marginTop: '1rem',
  maxWidth: '600px',
  border: '1px solid gray'
}

const Signup: FC = () => {
  changeTitle('Sign up')

  const [
    checkEmailAlreadyExists,
    {
      data: checkEmailData,
      loading: checkEmailLoading,
      error: checkEmailError //
    }
  ] = useLazyQuery(CHECK_EMAIL_ALREADY_EXISTS, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first'
  })

  const [addUser, { error: addUserError }] = useMutation(ADD_USER)
  const [form] = Form.useForm()

  const navigate = useNavigate()

  const [state, dispatch] = useAuthContext()
  const loggedIn = state.loggedIn

  const emailAlreadyExists = async (e: string) => {
    await checkEmailAlreadyExists({ variables: { email: e } })
    return checkEmailData
  }

  const handleFormSubmit = async (values: SignupFormInterface) => {
    const { user } = values
    const { firstName, lastName, email, password } = user
    const variables = { input: { email, password, firstName, lastName } }
    try {
      const res = await addUser({ variables })
      const token = res.data.addUser.token
      dispatch({ type: 'LOGIN', data: token })

      navigate(-1)
    } catch (e) {
      console.error(e)
    }
  }

  const handleChange = (changedValues: UserInterface) => {
    const { firstName, lastName, email, password } = changedValues
    if (firstName) form.setFieldsValue({ firstName })
    if (lastName) form.setFieldsValue({ lastName })
    if (email) form.setFieldsValue({ email })
    if (password) form.setFieldsValue({ password })
  }

  if (!loggedIn) return <Navigate to="/" />
  return (
    <Col style={colWrapper}>
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
        scrollToFirstError={true}
        style={formStyle}
      >
        <FirstName />
        <Form.Item
          name={['user', 'lastName']}
          label="Last name"
          style={{
            marginBottom: '12px'
          }}
          rules={[
            {
              required: true,
              message: (
                <Alert
                  type="error"
                  message="Last name is required"
                  showIcon
                />
              )
            },
            {
              pattern: new RegExp(/^[^\s]+$/),
              message: (
                <Alert
                  type="error"
                  message="Last name cannot contain spaces"
                  showIcon
                />
              )
            },
            {
              pattern: new RegExp(/^[^!";#$%&'()*+,./:;<=>?@[\]^_{|}~]+$/),
              message: (
                <Alert
                  type="error"
                  message="Last name cannot contain symbols"
                  showIcon
                />
              )
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
              message: (
                <Alert
                  type="error"
                  message="Email is required"
                  showIcon
                />
              )
            },
            {
              type: 'email',
              message: (
                <Alert
                  type="error"
                  message="Email must be valid"
                  showIcon
                />
              )
            },
            {
              validator: (_: any, value: any) => emailAlreadyExists(value),
              message: checkEmailLoading ? (
                <Alert
                  type="info"
                  message={<Space direction="vertical">Checking email</Space>}
                />
              ) : checkEmailError ? (
                <Alert
                  type="info"
                  message={
                    <Space direction="vertical">Check email error</Space>
                  }
                />
              ) : (
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
              )
            }
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
              message: (
                <Alert
                  type="error"
                  message="Password is required"
                  showIcon
                />
              )
            },
            {
              pattern: new RegExp(/^[A-Za-z]/),
              message: (
                <Alert
                  type="error"
                  message="Password must begin with a letter"
                  showIcon
                />
              )
            },
            {
              pattern: new RegExp(/\w{8,}/),
              message: (
                <Alert
                  type="error"
                  message="Password must have a minimum of 8 characters"
                  showIcon
                />
              )
            }
          ]}
          style={{
            marginBottom: '12px'
          }}
        >
          <Input.Password />
        </Form.Item>

        {addUserError && (
          <Form.Item label=" ">
            <Alert
              type="error"
              message="Couldn't sign you up."
            />
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
          <LoginLink />
        </Form.Item>
      </Form>
    </Col>
  )
}

export default Signup

const FirstName = () => (
  <Form.Item
    name={['user', 'firstName']}
    label="First name"
    style={{
      marginBottom: '12px'
    }}
    rules={[
      {
        required: true,
        message: (
          <Alert
            type="error"
            message="First name is required"
            showIcon
          />
        )
      },
      {
        pattern: new RegExp(/^[^\s]+$/),
        message: (
          <Alert
            type="error"
            message="First name cannot contain spaces"
            showIcon
          />
        )
      },
      {
        pattern: new RegExp(/^[^!";#$%&'()*+,./:;<=>?@[\]^_{|}~]+$/),
        message: (
          <Alert
            type="error"
            message="First name cannot contain symbols"
            showIcon
          />
        )
      }
    ]}
  >
    <Input />
  </Form.Item>
)
