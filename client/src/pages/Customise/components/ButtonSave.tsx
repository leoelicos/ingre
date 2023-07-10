import { Button, Form } from 'antd'
import React, { FC } from 'react'
import { IngreIconSave } from '../../../components/Icons/Icon.tsx'

const ButtonSave: FC<{ loading: any; saved: any }> = ({ loading, saved }) => (
  <Form.Item>
    <Button
      disabled={saved}
      type="primary"
      htmlType="submit"
      style={{ width: '100%', marginTop: '1rem' }}
      icon={<IngreIconSave />}
      shape="round"
    >
      {loading ? <>Saving…</> : saved ? <>Saved!</> : <>Save</>}
    </Button>
  </Form.Item>
)
export default ButtonSave
