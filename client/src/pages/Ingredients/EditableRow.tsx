import React, { FC, createContext } from 'react'
import { Form } from 'antd'
import type { FormInstance } from 'antd'

export const EditableContext = //
  createContext<null | FormInstance<any>>(null)

interface EditableRowProps {
  index: number
}

const EditableRow: FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form
      form={form}
      component={false}
    >
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}
export default EditableRow
