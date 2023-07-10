import React, { FC } from 'react'
import { Button, Form } from 'antd'

import { IngreIconClearCustom } from '../../../components/Icons/Icon.tsx'
import type { FormInstance } from 'antd/es/form/Form'

const ButtonClearAll: FC<{ form: FormInstance<any> }> = ({ form }) => (
  <Form.Item>
    <Button
      danger
      style={{
        width: '100%',
        marginTop: '0.3rem'
      }}
      onClick={() => {
        form.setFieldsValue({
          name: '',
          portions: '',
          ingredients: [
            {
              name: '',
              quantity: '',
              unit: '',
              category: ''
            }
          ]
        })
      }}
      icon={<IngreIconClearCustom />}
      shape="round"
    >
      <span style={{ marginLeft: '4px' }}>Clear all</span>
    </Button>
  </Form.Item>
)
export default ButtonClearAll
