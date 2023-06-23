/* react */
import React, { FC } from 'react'

/* ant */
import { Button } from 'antd'

const LoginButton: FC = () => {
  return (
    <Button
      type="primary"
      style={{ marginTop: '1rem' }}
    >
      Log in
    </Button>
  )
}
export default LoginButton
