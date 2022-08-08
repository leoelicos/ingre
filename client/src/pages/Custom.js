import { useStoreContext } from '../utils/state/GlobalState';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Col, Divider, Row } from 'antd';
import ContentTitle from '../components/ContentTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const App = (props) => {
  const [state] = useStoreContext();

  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
  };

  const handleChange = () => {
    form.setFieldsValue({
      recipes: []
    });
  };

  const setName = () => {
    form.setFieldsValue({
      name: state.customRecipe?.name || ''
    });
  };
  const initials = () => {
    const name = state.customRecipe?.name;
    const portions = state.customRecipe?.portions;
    const Ingredient = state.customRecipe?.ingredients.map((ingredient) => {
      return {
        key: ingredient._id,
        name: ingredient.name || ' ',
        quantity: ingredient.quantity || ' ',
        measure: ingredient.measure || ' ',
        category: ingredient.category.name || ' '
      };
    });
    const newInitial = { name, portions, Ingredient };
    // console.log('newInitial = ', newInitial);
    return newInitial;
  };

  return (
    <>
      <ContentTitle>Custom recipe</ContentTitle>
      <Form form={form} initialValues={initials()} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
        <Col style={{ width: '100%', maxWidth: '800px' }}>
          {/* recipe name and portions */}
          <Row>
            <Col span={16} style={{ /* background: 'gray', */ maxWidth: '710px' }}>
              <Divider orientation="left" orientationMargin="4px">
                Recipe name
              </Divider>

              <Form.Item name="name" rules={[{ required: true, message: 'Change required' }]}>
                <Input.TextArea onLoad={setName} onChange={handleChange} placeholder="Enter a name" autoSize={true} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={1}></Col>
            <Col span={7}>
              <Divider orientation="left" orientationMargin="4px">
                Portions
              </Divider>
              <Form.Item name="portions" rules={[{ required: true, message: 'Change required' }]}>
                <Input onChange={handleChange} placeholder="Enter a number" autoSize={true} width="100%" />
              </Form.Item>
            </Col>
          </Row>
          {/* ingredients */}
          <Row>
            <Col span={24}>
              <Form.List name="Ingredient">
                {(fields, { add, remove }) => (
                  <>
                    <Row>
                      <Col>
                        <Divider orientation="left" orientationMargin="4px">
                          Ingredients
                        </Divider>
                      </Col>
                      <Col>
                        <Divider orientation="left" orientationMargin="4px">
                          Quant.
                        </Divider>
                      </Col>
                      <Col>
                        <Divider orientation="left" orientationMargin="4px">
                          Measure
                        </Divider>
                      </Col>
                      <Col>
                        <Divider orientation="left" orientationMargin="4px">
                          Category
                        </Divider>
                      </Col>
                    </Row>
                    {fields.map((field) => (
                      <Row key={field.key} align="bottom" style={{ width: '100%', height: '40px' }}>
                        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.name !== curValues.name}>
                          {() => (
                            <Form.Item {...field} name={[field.name, 'name']} rules={[{ required: true, message: 'Missing name' }]} style={{ width: 'calc((100% - 30px) * 9 / 24)', marginRight: '3px' }}>
                              <Input onChange={handleChange} placeholder="Ingredient name" style={{ background: 'transparent' }} />
                            </Form.Item>
                          )}
                        </Form.Item>
                        <Form.Item {...field} placeholder="Quantity" name={[field.name, 'quantity']} rules={[{ required: true, message: 'Missing quantity' }]} style={{ width: 'calc((100% - 30px) * 2 / 24)', marginRight: '3px' }}>
                          <Input onChange={handleChange} placeholder="Quantity" style={{ background: 'transparent' }} />
                        </Form.Item>
                        <Form.Item {...field} placeholder="Measure" name={[field.name, 'measure']} rules={[{ required: true, message: 'Missing measure' }]} style={{ width: 'calc((100% - 30px) * 4 / 24)', marginRight: '3px' }}>
                          <Input onChange={handleChange} placeholder="Measure" style={{ background: 'transparent' }} />
                        </Form.Item>
                        <Form.Item {...field} placeholder="Category" name={[field.name, 'category']} rules={[{ required: true, message: 'Missing category' }]} style={{ width: 'calc((100% - 30px) * 9 / 24)', marginRight: '3px' }}>
                          <Input onChange={handleChange} placeholder="Category" style={{ background: 'transparent' }} />
                        </Form.Item>
                        <Form.Item>
                          <MinusCircleOutlined onClick={() => remove(field.name)} style={{ background: 'transparent', color: 'red' }} />
                        </Form.Item>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ maxWidth: '824px' }}>
                        Add ingredient
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item>
                <Col span={24}>
                  <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                    <Space>
                      <FontAwesomeIcon icon="fa-solid fa-floppy-disk" />
                      Save Recipe
                    </Space>
                  </Button>

                  <Button
                    type="secondary"
                    style={{ width: '100%', marginTop: '0.3rem' }}
                    onClick={() => {
                      form.resetFields();
                    }}
                  >
                    Reset
                  </Button>
                </Col>
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Form>
    </>
  );
};
export default App;
