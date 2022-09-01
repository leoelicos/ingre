// React hooks
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Ant components
import { Button, Form, Input, Col, Divider, Row, Alert } from 'antd';

// Custom components
import ContentTitle from '../components/ContentTitle';

// useContext
import { useStoreContext } from '../utils/state/GlobalState';

// ApolloClient
import { useApolloClient, useMutation } from '@apollo/client';
import { SAVE_RECIPE, UPDATE_RECIPE } from '../utils/apollo/mutations';

// Assets
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// useReducer
import { ADD_SAVED_RECIPE } from '../utils/state/actions';
import { GET_SAVED_RECIPES, GET_NUM_SAVED_RECIPES, GET_RECIPE } from '../utils/apollo/queries';

const eggImage = 'https://i.ebayimg.com/images/g/GxwAAOSwpI5eOv8Q/s-l500.jpg';
const App = () => {
  const [state, dispatch] = useStoreContext();
  const [form] = Form.useForm();
  const [addCustomRecipe, { error: saveRecipeError }] = useMutation(SAVE_RECIPE, { refetchQueries: [{ query: GET_SAVED_RECIPES }, { query: GET_NUM_SAVED_RECIPES }] });

  const [updateRecipe, { error: updateRecipeError }] = useMutation(UPDATE_RECIPE, { refetchQueries: [{ query: GET_SAVED_RECIPES }] });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [init, setInit] = useState({ name: 'Tea', portions: 2, ingredients: [{ name: 'p', quantity: 2, measure: 'unit', category: 'tea' }] });
  const [cancel, setCancel] = useState(false);

  const client = useApolloClient();

  const initialize = useCallback(async () => {
    let name, portions, ingredients;
    // console.log('[Custom] initialize', state.customRecipe);
    if (state.customRecipe?._id) {
      //* FROM BACKEND
      console.log('BACKEND');

      const res = await client.query({
        query: GET_RECIPE,
        variables: { id: state.customRecipe._id }
      });
      const data = JSON.parse(JSON.stringify(res.data.getRecipe));
      // dispatch({ type: ADD_EDIT_RECIPE, data: custom });

      name = data.name || 'Recipe';
      portions = parseInt(data.portions) || 1;
      ingredients =
        data.ingredients?.map((v) => {
          const ingredient = { ...v, category: v.category.name };
          return ingredient;
        }) || [];
      // dispatch({ type: ADD_EDIT_RECIPE, data: data });
    } else {
      //* FROM FRONTEND
      console.log('FRONTEND');
      name = state.customRecipe?.name || '';
      portions = parseInt(state.customRecipe?.portions) || '';
      ingredients = state.customRecipe?.ingredients?.map((v, i) => {
        const ingredient = {
          key: 'ingredient' + i,
          name: v.name || 'ingredient',
          quantity: parseFloat(v.quantity || 1),
          measure: v.measure || 'unit',
          category: v.category || 'Generic'
        };
        return ingredient;
      }) || [{ key: 'ingredient0', name: '', quantity: '', measure: '', category: '' }];
    }

    setInit({ name, portions, ingredients });
  }, [client, state.customRecipe?._id, state.customRecipe?.ingredients, state.customRecipe?.name, state.customRecipe?.portions]);

  const onFinish = async (values) => {
    if (cancel) return;

    try {
      console.log('onFinish', values);
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

      console.log('[onFinish] input = ', input);

      //* SERVER

      if (state.customRecipe?._id) {
        setLoading(true);
        const recipeId = state.customRecipe._id;
        const payload = { variables: { input, recipeId } };
        console.log('[onFinish] Update existing recipe', payload);
        payload.variables.recipeId = state.customRecipe?._id;
        const res = await updateRecipe(payload);
        const data = res.data.updateRecipe;
        console.log('[onFinish] Update - res', data);
        if (updateRecipeError) throw updateRecipeError;
      } else {
        setLoading(true);
        const payload = { variables: { input } };
        console.log('[onFinish] Create new recipe', payload);
        const res = await addCustomRecipe(payload);
        const data = res.data.saveRecipe;

        console.log('[onFinish] Create - res', data);
        if (saveRecipeError) throw saveRecipeError;
        dispatch({ type: ADD_SAVED_RECIPE, data });
      }
      setLoading(false);

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 1000);
      // dispatch({ type: CLEAR_EDIT_RECIPE });
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   return () => dispatch({ type: CLEAR_EDIT_RECIPE });
  // }, [dispatch]);

  useEffect(() => {
    form.setFieldsValue(init);
  }, [form, init]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const navigate = useNavigate();
  return (
    <Col style={{ width: '100%' }}>
      <Row>
        <ContentTitle>Customise</ContentTitle>
      </Row>

      <Form
        form={form}
        // initialValues={initials()}
        // initialValues={init}
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
                  Recipe Name
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
                  rules={[{ required: true, message: <Alert type="error" message="Required" showIcon icon={<FontAwesomeIcon icon="fa-solid fa-exclamation" />} /> }]}
                  style={{
                    marginRight: '4px'
                  }}
                  //
                >
                  <Input.TextArea
                    placeholder="Recipe name ✏️"
                    autoSize={true}
                    allowClear

                    //
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="portions"
                  rules={[{ required: true, message: <Alert type="error" message="Required" showIcon icon={<FontAwesomeIcon icon="fa-solid fa-exclamation" />} /> }]}
                  style={{ height: '100%' }}
                  //
                >
                  <Input.TextArea
                    placeholder="Recipe Portions ✏️"
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
                                rules={[{ required: true, message: <Alert type="error" message="Required" showIcon icon={<FontAwesomeIcon icon="fa-solid fa-exclamation" />} /> }]}
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
                                rules={[{ required: true, message: <Alert type="error" message="Required" showIcon icon={<FontAwesomeIcon icon="fa-solid fa-exclamation" />} /> }]}
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
                                rules={[{ required: true, message: <Alert type="error" message="Required" showIcon icon={<FontAwesomeIcon icon="fa-solid fa-exclamation" />} /> }]}
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
                                rules={[{ required: true, message: <Alert type="error" message="Required" showIcon icon={<FontAwesomeIcon icon="fa-solid fa-exclamation" />} /> }]}
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
                                  danger
                                  type="primary"
                                  onClick={() => remove(field.name)}
                                  style={{
                                    fontSize: '14px',
                                    height: '100%',
                                    color: 'white',
                                    padding: '0',
                                    border: '0',
                                    width: '100%'
                                    //
                                  }}
                                  shape="round"
                                  icon={<FontAwesomeIcon icon="fa-solid fa-trash" />}
                                  //
                                />
                              </Form.Item>
                            </Col>
                          </>
                        )}
                      </Form.Item>
                    </Row>
                  ))}
                  {/* Add ingredient */}
                  <Row style={{ width: '100%', marginTop: '1rem' }}>
                    <Form.Item style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        onClick={() => add()}
                        block
                        icon={<FontAwesomeIcon icon="fa-solid fa-plus" style={{ marginRight: '4px' }} />}
                        style={{ width: '100%' }}
                        shape="round"
                        //
                      >
                        Ingredient
                      </Button>
                    </Form.Item>
                  </Row>
                </>
              )}
            </Form.List>
          </Col>
        </Row>
        <Row style={{ marginTop: '1rem', paddingBottom: '10vh' }}>
          <Col span={24}>
            <Form.Item>
              <Button
                danger
                style={{
                  width: '100%',
                  marginTop: '0.3rem'
                  //
                }}
                onClick={() => {
                  form.setFieldsValue({
                    name: '',
                    portions: '',
                    ingredients: [{ name: '', quantity: '', unit: '', category: '' }]
                  });
                }}
                icon={<FontAwesomeIcon icon="fa-solid fa-eraser" style={{ marginRight: '4px' }} />}
                shape="round"
              >
                Clear all
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                danger
                type="dashed"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => {
                  form.setFieldsValue(init);
                }}
                icon={<FontAwesomeIcon icon="fa-solid fa-rotate-left" style={{ marginRight: '4px' }} />}
                shape="round"
              >
                Undo all
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                disabled={saved}
                type="primary"
                htmlType="submit"
                style={{ width: '100%', marginTop: '1rem' }}
                icon={<FontAwesomeIcon icon="fa-solid fa-floppy-disk" style={{ marginRight: '4px' }} />}
                shape="round"
                //
              >
                {loading ? <>Saving…</> : saved ? <>Saved!</> : <>Save</>}
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                danger
                disabled={saved}
                type="primary"
                htmlType="submit"
                style={{ width: '100%', marginTop: '1rem' }}
                shape="round"
                onClick={() => {
                  setCancel(true);
                  navigate(-1);
                }}
                //
              >
                Go back
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Col>
  );
};
export default App;
