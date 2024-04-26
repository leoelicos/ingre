import type { InputRef } from 'antd'
import { Form, Input } from 'antd'
import React, {
  FC,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { EditableContext } from './EditableRow.tsx'

interface Item {
  name: string
  quantity: number
  measure: string
  category: string
  fromRecipe: string
}

/* types */
interface EditableCellProps {
  title: ReactNode
  editable: boolean
  children: ReactNode
  dataIndex: keyof Item
  record: Item
  handleSave: (record: Item) => void
}

const EditableCell: FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<InputRef>(null)
  const form = useContext(EditableContext)

  // if (!form) return null

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    form!.setFieldsValue({
      [dataIndex]: record[dataIndex]
    })
  }

  const save = async () => {
    try {
      const values = await form!.validateFields()
      toggleEdit()
      handleSave({ ...record, ...values })
    } catch (e) {
      console.error('Save failed:', e)
    }
  }

  let cellRender = null
  if (!editable) {
    cellRender = children
  } else if (editing === true) {
    cellRender = (
      <Form.Item
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    )
  } else {
    cellRender = (
      <div
        className="editable-cell-value-wrap"
        onClick={toggleEdit}
      >
        {children}
      </div>
    )
  }

  return <td {...restProps}>{cellRender}</td>
}
export default EditableCell
