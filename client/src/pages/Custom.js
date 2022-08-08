import { useStoreContext } from '../utils/state/GlobalState';
// react
import { useState } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Col, Divider, Row } from 'antd';
import ContentTitle from '../components/ContentTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from '@apollo/client';
import { ADD_CUSTOM_RECIPE } from '../utils/apollo/mutations';
import { ADD_SAVED_RECIPE, CLEAR_EDIT_RECIPE } from '../utils/state/actions';
// import spinner from '../assets/spinner.gif';
const App = (props) => {
  const [state, dispatch] = useStoreContext();
  const [form] = Form.useForm();
  const [addCustomRecipe, { error }] = useMutation(ADD_CUSTOM_RECIPE);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const onFinish = async (values) => {
    // reset custom recipe
    console.log('Save button was clicked with these values:\n', values);

    const payload = {
      variables: {
        input: {
          name: values.name || 'Custom recipe',
          portions: parseInt(values.portions),
          ingredients: values.Ingredient.map((i) => {
            return {
              name: i.name || 'Ingredient',
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
    const data = mutationResponse.data.addCustomRecipe;
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
    const name = state.customRecipe?.name;
    const portions = parseInt(state.customRecipe?.portions);
    const Ingredient = state.customRecipe?.ingredients.map((ingredient) => {
      return {
        key: ingredient._id,
        name: ingredient.name || 'Ingredient',
        quantity: parseFloat(ingredient.quantity || 1),
        measure: ingredient.measure || 'unit',
        category: ingredient.category.name || 'Generic'
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
                Name
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
                      <Col xs={9} sm={9}>
                        <Divider orientation="left" orientationMargin="0">
                          Ingredients
                        </Divider>
                      </Col>

                      <Col xs={0} sm={0} md={2}>
                        <Divider orientation="left" orientationMargin="0">
                          Qty
                        </Divider>
                      </Col>
                      <Col xs={2} sm={2} md={0}>
                        <Divider orientation="left" orientationMargin="0">
                          Q.
                        </Divider>
                      </Col>
                      <Col xs={0} sm={0} md={4}>
                        <Divider orientation="left" orientationMargin="0">
                          Measure
                        </Divider>
                      </Col>
                      <Col xs={4} sm={4} md={0}>
                        <Divider orientation="left" orientationMargin="0">
                          Mea.
                        </Divider>
                      </Col>
                      <Col xs={9} sm={9}>
                        <Divider orientation="left" orientationMargin="0">
                          Category
                        </Divider>
                      </Col>
                    </Row>
                    {fields.map((field) => (
                      <Row key={field.key} align="baseline" style={{ width: '100%' }}>
                        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.name !== curValues.name} style={{}}>
                          {() => (
                            <Form.Item {...field} name={[field.name, 'name']} rules={[{ required: true, message: 'Missing name' }]} style={{ width: 'calc((100% - 30px) * 9 / 24)', marginRight: '3px', marginBottom: '0.3rem ', height: '100%' }}>
                              <Input.TextArea autoSize={true} onChange={handleChange} placeholder="Ingredient name" style={{ padding: '1px' }} />
                            </Form.Item>
                          )}
                        </Form.Item>
                        <Form.Item {...field} placeholder="Quantity" name={[field.name, 'quantity']} rules={[{ required: true, message: 'Missing quantity' }]} style={{ width: 'calc((100% - 30px) * 2 / 24)', marginRight: '3px', marginBottom: '0.3rem', height: '100%' }}>
                          <Input.TextArea autoSize={true} onChange={handleChange} placeholder="Qty" style={{ padding: '1px' }} />
                        </Form.Item>
                        <Form.Item {...field} placeholder="Measure" name={[field.name, 'measure']} rules={[{ required: true, message: 'Missing measure' }]} style={{ width: 'calc((100% - 30px) * 4 / 24)', marginRight: '3px', marginBottom: '0.3rem', height: '100%' }}>
                          <Input.TextArea autoSize={true} onChange={handleChange} placeholder="Meas" style={{ padding: '1px' }} />
                        </Form.Item>
                        <Form.Item {...field} placeholder="Category" name={[field.name, 'category']} rules={[{ required: true, message: 'Missing category' }]} style={{ width: 'calc((100% - 30px) * 9 / 24)', marginRight: '3px', marginBottom: '0.3rem', height: '100%' }}>
                          <Input.TextArea autoSize={true} onChange={handleChange} placeholder="Category" style={{ padding: '1px' }} />
                        </Form.Item>
                        <Form.Item style={{ borderRadius: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '-4px' }}>
                          <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: 'red', fontSize: '1rem', borderRadius: '50%', background: 'white' }} />
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
                  {saved && <Divider>Saved!</Divider>}
                  <Button disabled={saved} type="primary" htmlType="submit" style={{ width: '100%' }}>
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
