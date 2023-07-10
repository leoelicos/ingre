import { Button, Form } from 'antd'
import { FormInstance } from 'antd/es/form/Form'
import React, { FC } from 'react'
import { IngreIconUndoCustom } from '../../../components/Icons/Icon.tsx'

const ButtonUndoAll: FC<{ form: FormInstance<any>; init: any }> = ({
  form,
  init
}) => (
  <Form.Item>
    <Button
      danger
      type="dashed"
      style={{ width: '100%', marginTop: '1rem' }}
      onClick={() => {
        form.setFieldsValue(init)
      }}
      icon={<IngreIconUndoCustom />}
      shape="round"
    >
      Undo all
    </Button>
  </Form.Item>
)

export default ButtonUndoAll
