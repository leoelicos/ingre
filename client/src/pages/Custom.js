// React hooks
import { useState } from 'react';

// Ant components
import { Button, Form, Input, Space, Col, Divider, Row, Alert } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

// Custom components
import ContentTitle from '../components/ContentTitle';

// useContext
import { useStoreContext } from '../utils/state/GlobalState';

// ApolloClient
import { useMutation } from '@apollo/client';
import { SAVE_RECIPE, UPDATE_RECIPE } from '../utils/apollo/mutations';

// Assets
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// useReducer
import { ADD_SAVED_RECIPE, CLEAR_EDIT_RECIPE } from '../utils/state/actions';
import { GET_SAVED_RECIPES, GET_NUM_SAVED_RECIPES } from '../utils/apollo/queries';

const App = () => {
  const [state, dispatch] = useStoreContext();
  const [form] = Form.useForm();
  const [addCustomRecipe, { error }] = useMutation(SAVE_RECIPE, { refetchQueries: [{ query: GET_SAVED_RECIPES }, { query: GET_NUM_SAVED_RECIPES }] });

  const [updateRecipe] = useMutation(UPDATE_RECIPE, { refetchQueries: [{ query: GET_SAVED_RECIPES }] });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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
    return { name, portions, ingredients };
  };

  const onFinish = async (values) => {
    try {
      console.log('onFinish', values);
      const eggImage = 'https://i.ebayimg.com/images/g/GxwAAOSwpI5eOv8Q/s-l500.jpg';
      const input = {
        name: values.name || 'Custom recipe',
        portions: isNaN(parseInt(values.portions)) ? 1 : parseInt(values.portions),
        ingredients: values.ingredients.map((i) => {
          const name = i.name || 'Ingredient';
          const quantity = isNaN(parseFloat(i.quantity)) ? 1 : parseFloat(i.quantity);
          const measure = i.measure || 'unit';
          const category = i.category || 'Generic';
          const ingredient = { name, quantity, measure, category };
          return ingredient;
        }),
        picture_url: state.customRecipe?.picture_url || eggImage,
        edamamId: state.customRecipe?.edamamId || '-1'
      };
      const payload = { variables: { input } };
      console.log('custom payload = ', payload);
      setLoading(true);

      //! Can't work this out
      let mutationResponse;
      if (state.savedRecipes.find((r) => r.edamamId === state.customRecipe?.edamamId)) {
        // already exists in state, update
        console.log('already exists in state, update');
        mutationResponse = await updateRecipe(payload);
      } else {
        // does not exist in state, create new
        console.log('does not exist in state, create new');
        mutationResponse = await addCustomRecipe(payload);
      }

      setLoading(false);
      if (error) console.log('error ', error);
      const data = mutationResponse.data.saveRecipe;
      dispatch({ type: ADD_SAVED_RECIPE, data });
      setSaved(true);
      dispatch({ type: CLEAR_EDIT_RECIPE });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Col style={{ width: '100%' }}>
      <Row>
        <ContentTitle>Custom recipe</ContentTitle>
      </Row>
      <Form
        form={form}
        initialValues={initials()}
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        style={{ width: '100%' }}
        //
      >
        {/* recipe name and portions */}
        <Row style={{ width: '100%', marginBottom: '1rem' }}>
          <Col span={24}>
            <Row style={{ marginBottom: '0.3rem', fontWeight: 'bold', color: 'var(--ingre-dark-brown' }}>
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
                  rules={[{ required: true, message: <Alert type="error" message="Change required" /> }]}
                  style={{
                    marginRight: '4px'
                  }}
                  //
                >
                  <Input.TextArea
                    placeholder="✏️"
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
                    style={{
                      padding: '0px 16px 4px 4px !important',
                      borderRadius: '1rem'
                    }}
                    //
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        {/* ingredients */}
        <Row key="formbody" style={{ width: '100%', marginBottom: '1rem' }}>
          <Col key="formwrapper" style={{ width: '100%' }}>
            <Form.List name="ingredients">
              {(fields, { add, remove }) => (
                <>
                  <Row style={{ marginBottom: '0.3rem', fontWeight: 'bold', color: 'var(--ingre-dark-brown' }}>
                    <Col sm={0} span={6}>
                      Ingr
                    </Col>
                    <Col sm={0} span={5}>
                      Qty
                    </Col>
                    <Col sm={0} span={7}>
                      Unit
                    </Col>
                    <Col sm={0} span={6}>
                      Cate
                    </Col>
                    {/*  */}
                    <Col sm={8} span={0}>
                      Ingredient
                    </Col>
                    <Col sm={4} span={0}>
                      Qty
                    </Col>
                    <Col sm={4} span={0}>
                      Unit
                    </Col>
                    <Col sm={8} span={0}>
                      Category
                    </Col>
                  </Row>
                  {fields.map((field, idx) => (
                    <Row key={'ingredientRow' + idx} style={{ marginBottom: '4px', height: 'fit-content' }}>
                      <Form.Item
                        key={'ingredient'}
                        noStyle
                        shouldUpdate={(prevValues, curValues) => prevValues.name !== curValues.name}
                        style={{ marginTop: '1rem' }}
                        //
                      >
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
                                  style={{
                                    padding: '0px 16px 4px 4px !important',
                                    borderRadius: '1rem '
                                  }}
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
                                  style={{
                                    padding: '0px 16px 4px 4px !important',
                                    borderRadius: '1rem '
                                  }}
                                  //
                                />
                              </Form.Item>
                            </Col>

                            {/* Ingredient unit */}
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
                                  style={{
                                    padding: '0px 16px 4px 4px !important',
                                    borderRadius: '1rem'
                                  }}
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
                                  style={{
                                    padding: '0px 16px 4px 4px !important',
                                    borderRadius: '1rem'
                                  }}
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
                  <Row style={{ width: '100%', marginTop: '1rem' }}>
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
                <Button
                  disabled={saved}
                  type="primary"
                  htmlType="submit"
                  style={{ width: '100%' }}
                  //
                >
                  {loading ? (
                    <Space>Saving…</Space>
                  ) : saved ? (
                    <Space>Saved!</Space>
                  ) : (
                    <Space>
                      <FontAwesomeIcon icon="fa-solid fa-floppy-disk" />
                      Save
                    </Space>
                  )}
                </Button>

                <Button
                  type="secondary"
                  style={{ width: '100%', marginTop: '0.3rem' }}
                  onClick={() => {
                    form.setFieldsValue({
                      name: '',
                      portions: '',
                      ingredients: []
                    });
                  }}
                >
                  Clear all
                </Button>

                <Button
                  type="dashed"
                  style={{ width: '100%', marginTop: '0.3rem' }}
                  onClick={() => {
                    form.resetFields();
                  }}
                >
                  <Space>
                    <FontAwesomeIcon icon="fa-solid fa-rotate-left" /> Undo all edits
                  </Space>
                </Button>
              </Col>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Col>
  );
};
export default App;
