// import { useStoreContext } from '../utils/state/GlobalState';
// import { useState } from 'react';
// import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
// import { Button, Form, Input, Select, Space } from 'antd';
// import ContentTitle from '../components/ContentTitle';
// const { Option } = Select;
// const App = (props) => {
//   const [state, dispatch] = useStoreContext();
//   const [formState, setFormState] = useState({ name: 'Banana' }); // I can use this same method to initialize home page seeds

//   const sights = {
//     Beijing: ['Tiananmen', 'Great Wall'],
//     Shanghai: ['Oriental Pearl', 'The Bund']
//   };

//   const [form] = Form.useForm();

//   const onFinish = (values) => {
//     console.log('Received values of form:', values);
//   };

//   const handleChange = (e) => {
//     console.log('e = ', e);
//     form.setFieldsValue({
//       sights: []
//     });
//   };
//   const getName = () => {
//     console.log('the state is', state);
//   };
//   return (
//     <>
//       <ContentTitle>Custom recipe</ContentTitle>
//       <Form form={form} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
//         <Form.Item
//           name="name"
//           label="Name"
//           rules={[{ required: true, message: 'Enter a recipe name' }]}
//           //
//         >
//           <Input.TextArea onChange={handleChange} value={getName()} />
//         </Form.Item>
//         {/*  */}
//         <Form.List name="Ingredient">
//           {(fields, { add, remove }) => (
//             <>
//               {fields.map((field) => (
//                 <Space key={field.key} align="baseline">
//                   <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.area !== curValues.area || prevValues.sights !== curValues.sights}>
//                     {() => (
//                       <Form.Item
//                         {...field}
//                         placeholder="Ingredient"
//                         name={[field.name, 'name']}
//                         value={1}
//                         rules={[
//                           {
//                             required: true,
//                             message: 'Missing name'
//                           }
//                         ]}
//                       >
//                         <Input onChange={handleChange} value={formState.name}></Input>
//                       </Form.Item>
//                     )}
//                   </Form.Item>
//                   <Form.Item
//                     {...field}
//                     placeholder="Quantity"
//                     name={[field.name, 'quantity']}
//                     rules={[
//                       {
//                         required: true,
//                         message: 'Missing quantity'
//                       }
//                     ]}
//                   >
//                     <Input onChange={handleChange} />
//                   </Form.Item>
//                   <Form.Item
//                     {...field}
//                     placeholder="Measure"
//                     name={[field.name, 'measure']}
//                     rules={[
//                       {
//                         required: true,
//                         message: 'Missing measure'
//                       }
//                     ]}
//                   >
//                     <Input onChange={handleChange} />
//                   </Form.Item>
//                   <Form.Item
//                     {...field}
//                     placeholder="Category"
//                     name={[field.name, 'category']}
//                     rules={[
//                       {
//                         required: true,
//                         message: 'Missing category'
//                       }
//                     ]}
//                   >
//                     <Input onChange={handleChange} />
//                   </Form.Item>
//                   <MinusCircleOutlined onClick={() => remove(field.name)} />
//                 </Space>
//               ))}

//               <Form.Item>
//                 <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
//                   Add ingredient
//                 </Button>
//               </Form.Item>
//             </>
//           )}
//         </Form.List>
//         {/*  */}
//         <Form.Item>
//           <Button type="primary" htmlType="submit">
//             Submit
//           </Button>
//         </Form.Item>
//       </Form>
//     </>
//   );
// };
// export default App;

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space } from 'antd';
import React from 'react';
const { Option } = Select;
const areas = [
  {
    label: 'Beijing',
    value: 'Beijing'
  },
  {
    label: 'Shanghai',
    value: 'Shanghai'
  }
];
const sights = {
  Beijing: ['Tiananmen', 'Great Wall'],
  Shanghai: ['Oriental Pearl', 'The Bund']
};

const App = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form:', values);
  };

  const handleChange = () => {
    form.setFieldsValue({
      sights: []
    });
  };

  return (
    <Form form={form} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
      <Form.Item
        name="area"
        label="Area"
        rules={[
          {
            required: true,
            message: 'Missing area'
          }
        ]}
      >
        <Select options={areas} onChange={handleChange} />
      </Form.Item>
      <Form.List name="sights">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Space key={field.key} align="baseline">
                <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.area !== curValues.area || prevValues.sights !== curValues.sights}>
                  {() => (
                    <Form.Item
                      {...field}
                      label="Sight"
                      name={[field.name, 'sight']}
                      rules={[
                        {
                          required: true,
                          message: 'Missing sight'
                        }
                      ]}
                    >
                      <Select
                        disabled={!form.getFieldValue('area')}
                        style={{
                          width: 130
                        }}
                      >
                        {(sights[form.getFieldValue('area')] || []).map((item) => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </Form.Item>
                <Form.Item
                  {...field}
                  label="Price"
                  name={[field.name, 'price']}
                  rules={[
                    {
                      required: true,
                      message: 'Missing price'
                    }
                  ]}
                >
                  <Input />
                </Form.Item>

                <MinusCircleOutlined onClick={() => remove(field.name)} />
              </Space>
            ))}

            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add sights
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default App;
