// React hooks
import { useEffect, useState } from 'react';

// Ant components
import { Form, Input, Cascader } from 'antd';

// Custom components
import RecipeCardContainer from '../components/RecipeCardContainer';
import ContentTitle from '../components/ContentTitle';
import ContentSubtitle from '../components/ContentSubtitle';

// Edamam API
import FetchEdamam from '../utils/api/index.js';

// useContext
import { useStoreContext } from '../utils/state/GlobalState';

// useReducer
import { UPDATE_SEARCH_RECIPES } from '../utils/state/actions';

// Assets
import spinner from '../assets/spinner.gif';

// Ant subcomponents
const { SHOW_CHILD } = Cascader;

function App() {
  // useContext
  const [state, dispatch] = useStoreContext();
  // useState
  const [loadingEdamam, setLoadingEdamam] = useState(false);
  const [edamamRecipes, setEdamamRecipes] = useState(state.searchRecipes);
  const [queryState, setQueryState] = useState('');
  const [formState, setFormState] = useState({
    diet: [],
    health: [],
    cuisineType: [],
    mealType: [],
    dishType: []
    //
  });

  // useForm
  const [form] = Form.useForm();

  // Handle search submit
  const handleFormSubmit = async (values) => {
    try {
      // load API results into local state
      setLoadingEdamam(true);
      const search = { q: queryState, ...formState };
      const hits = await FetchEdamam(search);
      setEdamamRecipes(hits);
      setLoadingEdamam(false);

      // update global store
      const type = UPDATE_SEARCH_RECIPES;
      const data = edamamRecipes;
      const payload = { type, data };
      dispatch(payload);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (event) => {
    setQueryState(event.target.value);
  };

  const handleFilterChange = (event) => {
    const obj = { diet: [], health: [], cuisineType: [], mealType: [], dishType: [] };
    event.forEach((e) => {
      if (e[0] === 'diet') obj.diet[obj.diet.length] = e[1];
      else if (e[0] === 'health') obj.health[obj.health.length] = e[1];
      else if (e[0] === 'cuisine-type') obj.cuisineType[obj.cuisineType.length] = e[1];
      else if (e[0] === 'meal-type') obj.mealType[obj.mealType.length] = e[1];
      else if (e[0] === 'dish-type') obj.dishType[obj.dishType.length] = e[1];
    });
    const newState = { ...formState, ...obj };
    console.log('newState = ', newState);
    setFormState(newState);
  };

  useEffect(() => {
    document.title = 'Search';
  }, []);

  return (
    <>
      <ContentTitle>Search recipes</ContentTitle>
      <ContentSubtitle>What do you want to cook?</ContentSubtitle>
      <Form
        form={form}
        initialValues={{ remember: true }}
        onFinish={handleFormSubmit}
        wrapperCol={24}
        layout={'vertical'}
        style={{ maxWidth: '824px' }}
        //
      >
        <Form.Item
          rules={[{ required: true, message: 'Please input your query!' }]}
          style={{
            marginBottom: '0.3rem'
            //
          }}
          onChange={handleChange}
        >
          <Input.Search
            name="q"
            type="text"
            id="q"
            value={formState.q}
            size="middle"
            enterButton={true}
            loading={false}
            onSearch={handleFormSubmit}
            //
          />
        </Form.Item>

        <Form.Item
          rules={[
            {
              required: true,
              message: 'Please input your query!'
              //
            }
          ]}
        >
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
            onChange={handleFilterChange}
            multiple
            maxTagCount="responsive"
            showCheckedStrategy={SHOW_CHILD}
            expandTrigger="hover"
            dropdownClassName="dropdownFilter"
            //
          />
        </Form.Item>
      </Form>

      {loadingEdamam ? (
        //
        <img src={spinner} alt="loading" />
      ) : (
        <>
          <RecipeCardContainer results={edamamRecipes} loading={loadingEdamam} />
        </>
      )}
    </>
  );
}

export default App;
