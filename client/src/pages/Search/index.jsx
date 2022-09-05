// React hooks
import { useEffect, useState } from 'react';

// Ant components
import { Form, Input, Cascader, Row, Spin, Divider, Col } from 'antd';

// Custom components
import RecipeCardContainer from '../../components/RecipeCardContainer';
import ContentTitle from '../../components/ContentTitle';

// Edamam API
import FetchEdamam from '../../utils/api/index.js';

// useContext
import { useStoreContext } from '../../utils/state/GlobalState';

// useReducer
import { UPDATE_SEARCH_RECIPES } from '../../utils/state/actions';

// get API key
import { GET_API_KEY } from '../../utils/apollo/queries';
import { useApolloClient } from '@apollo/client';

// Ant subcomponents
const { SHOW_CHILD } = Cascader;

function Search() {
  const client = useApolloClient();

  // Global state
  const [state, dispatch] = useStoreContext();

  // Local state
  const [loadingEdamam, setLoadingEdamam] = useState(false);
  const [edamamRecipes, setEdamamRecipes] = useState(state.searchRecipes);
  const blankForm = { diet: [], health: [], cuisineType: [], mealType: [], dishType: [] };
  const [formState, setFormState] = useState(blankForm);

  // Ant Form hook to enable setFormFields()
  const [form] = Form.useForm();

  const handleFormSubmit = async (values, event) => {
    console.log('values', values, '\nformState', formState);
    try {
      // prevent API call when Ant.Search form is cleared with the 'x' button
      if (event.type === 'click' && event.target.value === '' && event.currentTarget.tagName === 'INPUT') return;

      // Flag API fetch
      setLoadingEdamam(true);

      // Apollo Query to get Edamam API credentials
      const res = await client.query({ query: GET_API_KEY });
      if (!res) throw new Error('[handleRefresh] GET_API_KEY error');

      // Call API
      const search = { q: values, ...formState };
      const appId = res.data.getApiKey.appId;
      const appKey = res.data.getApiKey.appKey;
      const hits = await FetchEdamam(search, appId, appKey);

      // Store results in local state
      await setEdamamRecipes(hits);

      // Store results in global state
      dispatch({ type: UPDATE_SEARCH_RECIPES, data: edamamRecipes });

      // Unflag API fetch
      setLoadingEdamam(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterChange = (event) => {
    const newState = event.reduce(
      (prev, curr) => {
        let key = curr[0];
        let val = curr[1];
        if (key === 'diet') prev.diet.push(val);
        else if (key === 'health') prev.health.push(val);
        else if (key === 'cuisine-type') prev.cuisineType.push(val);
        else if (key === 'meal-type') prev.mealType.push(val);
        else if (key === 'dish-type') prev.dishType.push(val);
        return prev;
      },
      { diet: [], health: [], cuisineType: [], mealType: [], dishType: [] }
    );
    console.log('newState', newState);
    setFormState(newState);
  };

  useEffect(() => {
    document.title = 'Search';
  }, []);

  return (
    <Col style={{ width: '100%' }}>
      <Row>
        <ContentTitle>Search</ContentTitle>
      </Row>
      <Row>
        <Form
          form={form}
          initialValues={{ remember: true }}
          onFinish={handleFormSubmit}
          layout={'vertical'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '600px'
          }}
          //
        >
          <Form.Item
            name="q"
            style={{
              marginBottom: '0.3rem'

              //
            }}
          >
            <Input.Search
              placeholder="Search"
              name="q"
              type="text"
              id="q"
              value={formState.q}
              size="large"
              enterButton={true}
              loading={false}
              onSearch={handleFormSubmit}
              allowClear={true}
              //
            />
          </Form.Item>

          <Form.Item>
            <Cascader
              placeholder="Filters…"
              options={[
                {
                  label: 'Diet',
                  value: 'diet',
                  children: [
                    { label: 'Balanced', value: 'balanced' },
                    { label: 'High-fiber', value: 'high-fiber' },
                    { label: 'High-protein', value: 'high-protein' },
                    { label: 'Low-carb', value: 'low-carb' },
                    { label: 'Low-fat', value: 'low-fat' },
                    { label: 'Low-sodium', value: 'low-sodium' }
                  ]
                },
                {
                  label: 'Health',
                  value: 'health',
                  children: [
                    { label: 'Dairy-free', value: 'dairy-free' },
                    { label: 'Egg-free', value: 'egg-free' },
                    { label: 'Fish-free', value: 'fish-free' },
                    { label: 'Gluten-free', value: 'gluten-free' },
                    { label: 'Low-potassium', value: 'low-potassium' },
                    { label: 'Low-sugar', value: 'low-sugar' },
                    { label: 'Lupine-free', value: 'lupine-free' },
                    { label: 'Mediterranean', value: 'Mediterranean' },
                    { label: 'Mollusk-free', value: 'mollusk-free' },
                    { label: 'Mustard-free', value: 'mustard-free' },
                    { label: 'No-oil-added', value: 'no-oil-added' },
                    { label: 'Paleo', value: 'paleo' },
                    { label: 'Peanut-free', value: 'peanut-free' },
                    { label: 'Pescatarian', value: 'pescatarian' },
                    { label: 'Pork-free', value: 'pork-free' },
                    { label: 'Red-meat-free', value: 'red-meat-free' },
                    { label: 'Sesame-free', value: 'sesame-free' },
                    { label: 'Shellfish-free', value: 'shellfish-free' },
                    { label: 'Soy-free', value: 'soy-free' },
                    { label: 'Sugar-conscious', value: 'sugar-conscious' },
                    { label: 'Sulfite-free', value: 'sulfite-free' },
                    { label: 'Tree-nut-free', value: 'tree-nut-free' },
                    { label: 'Vegan', value: 'vegan' },
                    { label: 'Vegetarian', value: 'vegetarian' },
                    { label: 'Wheat-free', value: 'wheat-free' }
                  ]
                },
                {
                  label: 'Cuisine',
                  value: 'cuisine-type',
                  children: [
                    { label: 'American', value: 'American' },
                    { label: 'Asian', value: 'Asian' },
                    { label: 'British', value: 'British' },
                    { label: 'Caribbean', value: 'Caribbean' },
                    { label: 'Central Europe', value: 'Central Europe' },
                    { label: 'Chinese', value: 'Chinese' },
                    { label: 'Eastern Europe', value: 'Eastern Europe' },
                    { label: 'French', value: 'French' },
                    { label: 'Indian', value: 'Indian' },
                    { label: 'Italian', value: 'Italian' },
                    { label: 'Japanese', value: 'Japanese' },
                    { label: 'Mediterranean', value: 'Mediterranean' },
                    { label: 'Mexican', value: 'Mexican' },
                    { label: 'Middle Eastern', value: 'Middle Eastern' },
                    { label: 'Nordic', value: 'Nordic' },
                    { label: 'South American', value: 'South American' },
                    { label: 'South East Asian', value: 'South East Asian' }
                  ]
                },
                {
                  label: 'Meal',
                  value: 'meal-type',
                  children: [
                    { label: 'Breakfast', value: 'Breakfast' },
                    { label: 'Dinner', value: 'Dinner' },
                    { label: 'Lunch', value: 'Lunch' },
                    { label: 'Snack', value: 'Snack' },
                    { label: 'Teatime', value: 'Teatime' }
                  ]
                },
                {
                  label: 'Dish',
                  value: 'dish-type',
                  children: [
                    { label: 'Biscuits and cookies', value: 'Biscuits-and-cookies' },
                    { label: 'Bread', value: 'Bread' },
                    { label: 'Cereals', value: 'Cereals' },
                    { label: 'Condiments and sauces', value: 'Condiments-and-sauces' },
                    { label: 'Desserts', value: 'Desserts' },
                    { label: 'Drinks', value: 'Drinks' },
                    { label: 'Main course', value: 'Main-course' },
                    { label: 'Pancake', value: 'Pancake' },
                    { label: 'Preps', value: 'Preps' },
                    { label: 'Preserve', value: 'Preserve' },
                    { label: 'Salad', value: 'Salad' },
                    { label: 'Sandwiches', value: 'Sandwiches' },
                    { label: 'Side dish', value: 'Side dish' },
                    { label: 'Soup', value: 'Soup' },
                    { label: 'Starter', value: 'Starter' },
                    { label: 'Sweets', value: 'Sweets' }
                  ]
                }
              ]}
              allowClear={true}
              onChange={handleFilterChange}
              multiple
              maxTagCount="responsive"
              showCheckedStrategy={SHOW_CHILD}
              expandTrigger="hover"
              dropdownClassName="dropdownFilter"
              style={{
                width: 'calc(100% - 64px)'
                //
              }}
              //
            />
          </Form.Item>
        </Form>
      </Row>
      <Row>
        {loadingEdamam ? (
          //
          <Divider>
            <Spin tip="Loading…"></Spin>
          </Divider>
        ) : (
          <RecipeCardContainer results={edamamRecipes} loading={loadingEdamam} />
        )}
      </Row>
    </Col>
  );
}

export default Search;
