import { Button, Form } from 'antd'
import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const ButtonBack: FC<{ saved: any; setCancel: any }> = ({
  saved,
  setCancel
}) => {
  const navigate = useNavigate()
  return (
    <Form.Item>
      <Button
        danger
        disabled={saved}
        type="primary"
        htmlType="submit"
        style={{ width: '100%', marginTop: '1rem' }}
        shape="round"
        onClick={() => {
          setCancel(true)
          navigate(-1)
        }}
      >
        Go back
      </Button>
    </Form.Item>
  )
}
export default ButtonBack
