import { useStoreContext } from '../utils/state/GlobalState';
// react
import { useState } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Col, Divider, Row } from 'antd';
import ContentTitle from '../components/ContentTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from '@apollo/client';
import { SAVE_RECIPE } from '../utils/apollo/mutations';
import { ADD_SAVED_RECIPE, CLEAR_EDIT_RECIPE } from '../utils/state/actions';

const App = (props) => {
  const [state, dispatch] = useStoreContext();
  const [form] = Form.useForm();
  const [addCustomRecipe, { error }] = useMutation(SAVE_RECIPE);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const onFinish = async (values) => {
    console.log('Save button was clicked with these values:\n', values);
    const payload = {
      variables: {
        input: {
          name: values.name || 'Custom recipe',
          portions: parseInt(values.portions),
          ingredients: values.ingredients.map((i) => {
            return {
              name: i.name || 'ingredients',
              quantity: parseFloat(i.quantity),
              measure: i.measure || 'unit',
              category: i.category || 'Generic'
            };
          })
        }
      }
    };
    console.log('Payload = ', payload);

    setLoading(true);
    const mutationResponse = await addCustomRecipe(payload);
    setLoading(false);
    if (error) console.log('error ', error);
    console.log('mutationResponse =', mutationResponse);
    const data = mutationResponse.data.saveRecipe;
    console.log('data = ');
    console.log(data);
    dispatch({ type: ADD_SAVED_RECIPE, data });
    setSaved(true);
    console.log('added recipe to state.savedRecipes');
    dispatch({ type: CLEAR_EDIT_RECIPE });
    console.log('cleared Custom recipe');
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
    const name = state.customRecipe?.name || '';
    const portions = parseInt(state.customRecipe?.portions) || '';
    const ingredients =
      state.customRecipe?.ingredients?.map((ingredient, idx) => {
        return {
          key: ingredient._id || ingredient.foodId || 'ingredient' + idx,
          name: ingredient.name || 'ingredient',
          quantity: parseFloat(ingredient.quantity || 1),
          measure: ingredient.measure || 'unit',
          category: ingredient.category.name || ingredient.category || 'Generic'
        };
      }) || [];
    const newInitial = { name, portions, ingredients };
    console.log('newInitial =', newInitial);
    // console.log('newInitial = ', newInitial);
    return newInitial;
  };

  return (
    <>
      <ContentTitle>Custom recipe</ContentTitle>
      <Form
        form={form}
        initialValues={initials()}
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        onValuesChange={handleChange}
        //
      >
        <Col span={24} style={{ maxWidth: '800px' }}>
          {/* recipe name and portions */}
          <Row>
            <Col span={24}>
              <Row>
                <Col span={16}>
                  <Divider orientation="left" orientationMargin="0">
                    Name
                  </Divider>
                </Col>
                <Col span={8}>
                  <Divider orientation="left" orientationMargin="0">
                    Portions
                  </Divider>
                </Col>
              </Row>
              <Row>
                <Col span={16}>
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Change required' }]}
                    style={{ marginRight: '4px' }}
                    //
                  >
                    <Input.TextArea
                      onLoad={setName}
                      placeholder="Name✏️"
                      autoSize={true}
                      allowClear
                      //
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="portions"
                    rules={[{ required: true, message: 'Change required' }]}
                    style={{ height: '100%' }}
                    //
                  >
                    <Input.TextArea
                      placeholder="✏️"
                      autoSize={true}
                      allowClear
                      style={{ height: '100%' }}
                      //
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          {/* ingredients */}
          <Row key="formbody">
            <Col key="formwrapper" span={24}>
              <Form.List name="ingredients">
                {(fields, { add, remove }) => (
                  <>
                    <Row>
                      <Col span={6} sm={8}>
                        <Divider orientation="left" orientationMargin="0">
                          Ingredient
                        </Divider>
                      </Col>

                      <Col span={5} sm={4}>
                        <Divider orientation="left" orientationMargin="0">
                          Qty
                        </Divider>
                      </Col>
                      <Col span={7} sm={4}>
                        <Divider orientation="left" orientationMargin="0">
                          Unit
                        </Divider>
                      </Col>
                      <Col span={6} sm={8}>
                        <Divider orientation="left" orientationMargin="0">
                          Category
                        </Divider>
                      </Col>
                    </Row>
                    {fields.map((field) => (
                      <Row style={{ marginBottom: '4px', height: 'fit-content' }}>
                        <Form.Item key={'ingredient'} noStyle shouldUpdate={(prevValues, curValues) => prevValues.name !== curValues.name} style={{ marginTop: '1rem' }}>
                          {() => (
                            <>
                              {/* Ingredient name */}
                              <Col span={6} sm={8}>
                                <Form.Item
                                  {...field}
                                  key="name"
                                  name={[field.name, 'name']}
                                  rules={[{ required: true, message: '*' }]}
                                  style={{ marginRight: '4px', padding: '0px 16px 4px 4px !important' }}
                                  //
                                >
                                  <Input.TextArea
                                    // allowClear={true}
                                    autoSize
                                    placeholder="✏️"
                                    allowClear
                                    //
                                  />
                                </Form.Item>
                              </Col>

                              {/* Ingredient quantity */}
                              <Col span={5} sm={4}>
                                <Form.Item
                                  {...field}
                                  key="quantity"
                                  name={[field.name, 'quantity']}
                                  rules={[{ required: true, message: '*' }]}
                                  style={{ marginRight: '4px' }}
                                  //
                                >
                                  <Input.TextArea
                                    autoSize={true}
                                    placeholder="✏️"

                                    //
                                  />
                                </Form.Item>
                              </Col>

                              {/* Ingredient measure */}
                              <Col span={7} sm={4}>
                                <Form.Item
                                  {...field}
                                  key="measure"
                                  name={[field.name, 'measure']}
                                  rules={[{ required: true, message: '*' }]}
                                  style={{ marginRight: '4px' }}

                                  //
                                >
                                  <Input.TextArea
                                    autoSize
                                    placeholder="✏️"

                                    //
                                  />
                                </Form.Item>
                              </Col>

                              {/* Ingredient category */}
                              <Col span={5} sm={7}>
                                <Form.Item
                                  {...field}
                                  key="category"
                                  name={[field.name, 'category']}
                                  rules={[{ required: true, message: '*' }]}
                                  style={{ marginRight: '4px', padding: '0px 16px 4px 4px !important' }}
                                  //
                                >
                                  <Input.TextArea
                                    autoSize
                                    placeholder="✏️"
                                    allowClear
                                    style={{ padding: '0px 16px 4px 4px !important' }}
                                    //
                                  />
                                </Form.Item>
                              </Col>

                              {/* Delete ingredient */}
                              <Col span={1}>
                                <Form.Item
                                  key="delete"
                                  style={{
                                    borderRadius: '50%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    height: '100%'
                                    //
                                  }}
                                >
                                  <Button
                                    onClick={() => remove(field.name)}
                                    style={{
                                      background: 'var(--ingre-dark-brown)',
                                      fontSize: 'calc(14px + 0.5vw',
                                      height: '100%',
                                      color: 'white',
                                      padding: '0',
                                      border: '0',
                                      width: '100%'
                                      //
                                    }}
                                    //
                                  >
                                    <MinusCircleOutlined />
                                  </Button>
                                </Form.Item>
                              </Col>
                            </>
                          )}
                        </Form.Item>
                      </Row>
                    ))}
                    <Row>
                      <Form.Item style={{ width: '100%', maxWidth: '824px' }}>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                          style={{ width: '100%', maxWidth: '824px' }}
                          //
                        >
                          Add ingredient
                        </Button>
                      </Form.Item>
                    </Row>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item>
                <Col span={24}>
                  {saved && <Divider>Saved!</Divider>}
                  <Button
                    disabled={saved}
                    type="primary"
                    htmlType="submit"
                    style={{ width: '100%' }}
                    //
                  >
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
