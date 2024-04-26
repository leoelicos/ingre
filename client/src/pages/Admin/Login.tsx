import { useMutation } from '@apollo/client'
import { Alert, Button, Col, Divider, Form, Input, Row } from 'antd'
import React, { FC } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import ContentSubtitle from '../../components/Text/ContentSubtitle.tsx'
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import { LOGIN } from '../../lib/apollo/graphQL/mutations.ts'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'
import { changeTitle } from '../../utils/changeTitle.ts'

const colStyle = {
  width: '100%',
  display: 'flex',
  flexFlow: 'column nowrap',
  alignItems: 'center'
}

const formStyle = {
  width: '100%',
  marginTop: '1rem',
  maxWidth: '600px'
}

interface UserLogin {
  email: string
  password: string
}

interface UserLoginForm {
  user: UserLogin
}

const Login: FC = () => {
  changeTitle('Log in')

  const [login, { error }] = useMutation(LOGIN)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const [authState, dispatch] = useAuthContext()
  const loggedIn = authState.loggedIn

  const handleFormSubmit = async (values: UserLoginForm) => {
    const { user } = values
    const { email, password } = user
    const payload = { email, password }

    try {
      console.log('payload = ', payload)
      const res = await login({ variables: payload })
      const token = res.data.login.token
      // console.log('localstorage token', token)
      dispatch({ type: 'LOGIN', data: token })

      navigate(-1)
    } catch (e) {
      console.error(e)
    }
  }

  const handleChange = (changedValues: UserLogin) => {
    const { email, password } = changedValues
    if (email) form.setFieldsValue({ email })
    if (password) form.setFieldsValue({ password })
  }

  if (loggedIn) return <Navigate to="/" />

  return (
    <Col style={colStyle}>
      <Row>
        <ContentTitle>Log in</ContentTitle>
      </Row>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        labelAlign="right"
        initialValues={{ remember: true }}
        colon={false}
        onValuesChange={handleChange}
        onFinish={handleFormSubmit}
        style={formStyle}
      >
        <Form.Item
          name={['user', 'email']}
          label="Email"
          style={{
            marginBottom: '12px'
          }}
          rules={[
            {
              required: true,
              message: (
                <Alert
                  type="warning"
                  message="Please input your email!"
                />
              )
            }
          ]}
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
                  type="warning"
                  message="Please input your password!"
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

        {error && (
          <Form.Item label=" ">
            <Alert
              message="Couldn't log you in."
              type="error"
            />
          </Form.Item>
        )}

        <Form.Item label=" ">
          <Button
            type="primary"
            htmlType="submit"
            block
          >
            Submit
          </Button>
        </Form.Item>
        <Divider />
        <Form.Item label=" ">
          <ContentSubtitle>No account?</ContentSubtitle>
          <Link to="/signup">
            <Button
              type="ghost"
              block
            >
              Sign up
            </Button>
          </Link>
        </Form.Item>
      </Form>
    </Col>
  )
}

export default Login
