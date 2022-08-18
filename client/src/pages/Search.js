// We import useState and useEffect in our component
import React, { useEffect, useState } from 'react';
import { Form, Input, Space, Divider, Cascader } from 'antd';
import { useStoreContext } from '../utils/state/GlobalState';
// components
import RecipeCardContainer from '../components/RecipeCardContainer';
import Empty from '../components/Empty';
import spinner from '../assets/spinner.gif';
// mutations
import ContentTitle from '../components/ContentTitle';
import ContentSubtitle from '../components/ContentSubtitle';

import Auth from '../utils/auth';
import FetchEdamam from '../utils/api/index.js';
import { UPDATE_SEARCH_RECIPES } from '../utils/state/actions';

const { SHOW_CHILD } = Cascader;

function App() {
  const [state, dispatch] = useStoreContext();
  const [loadingEdamam, setLoadingEdamam] = useState(false);
  const [edamamRecipes, setEdamamRecipes] = useState(state.searchRecipes.length ? state.searchRecipes : []);

  const [formState, setFormState] = useState({
    q: '',
    diet: [],
    health: [],
    cuisineType: [],
    mealType: [],
    dishType: []
    //
  });

  // Search mutation
  const handleFormSubmit = async (event) => {
    console.log('Search form submitted, fetchEdamam');
    try {
      setLoadingEdamam(true);
      const hits = await FetchEdamam();
      console.log('hits = ', hits);
      setEdamamRecipes(hits);
      setLoadingEdamam(false);
      dispatch({ type: UPDATE_SEARCH_RECIPES, data: edamamRecipes });
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value
    });
    // console.log('formState = ', formState);
  };

  const handleFilterChange = (event) => {
    const obj = { q: formState.q, diet: [], health: [], cuisineType: [], mealType: [], dishType: [] };
    event.forEach((e) => {
      if (e[0] === 'diet') obj.diet[obj.diet.length] = e[1];
      else if (e[0] === 'health') obj.health[obj.health.length] = e[1];
      else if (e[0] === 'cuisine-type') obj.cuisineType[obj.cuisineType.length] = e[1];
      else if (e[0] === 'meal-type') obj.mealType[obj.mealType.length] = e[1];
      else if (e[0] === 'dish-type') obj.dishType[obj.dishType.length] = e[1];
    });
    setFormState(obj);
  };

  /*   useEffect(() => {
    console.log('formState = ', formState);
  }, [formState]); */

  useEffect(() => {
    document.title = 'ingré Search';
  }, []);

  const formItemLayout = {
    wrapperCol: {
      span: 14
    }
  };

  const options = [
    {
      label: 'Diet',
      value: 'diet',
      children: [
        {
          label: 'Balanced',
          value: 'balanced'
        },
        {
          label: 'High-fiber',
          value: 'high-fiber'
        },
        {
          label: 'High-protein',
          value: 'high-protein'
        },
        {
          label: 'Low-carb',
          value: 'low-carb'
        },
        {
          label: 'Low-fat',
          value: 'low-fat'
        },
        {
          label: 'Low-sodium',
          value: 'low-sodium'
        }
      ]
    },
    {
      label: 'Health',
      value: 'health',
      children: [
        {
          label: 'Dairy-free',
          value: 'dairy-free'
        },
        {
          label: 'Egg-free',
          value: 'egg-free'
        },
        {
          label: 'Fish-free',
          value: 'fish-free'
        },
        {
          label: 'Gluten-free',
          value: 'gluten-free'
        },
        {
          label: 'Low-potassium',
          value: 'low-potassium'
        },
        {
          label: 'Low-sugar',
          value: 'low-sugar'
        },
        {
          label: 'Lupine-free',
          value: 'lupine-free'
        },
        {
          label: 'Mediterranean',
          value: 'Mediterranean'
        },
        {
          label: 'Mollusk-free',
          value: 'mollusk-free'
        },
        {
          label: 'Mustard-free',
          value: 'mustard-free'
        },
        {
          label: 'No-oil-added',
          value: 'no-oil-added'
        },
        {
          label: 'Paleo',
          value: 'paleo'
        },
        {
          label: 'Peanut-free',
          value: 'peanut-free'
        },
        {
          label: 'Pescatarian',
          value: 'pescatarian'
        },
        {
          label: 'Pork-free',
          value: 'pork-free'
        },
        {
          label: 'Red-meat-free',
          value: 'red-meat-free'
        },
        {
          label: 'Sesame-free',
          value: 'sesame-free'
        },
        {
          label: 'Shellfish-free',
          value: 'shellfish-free'
        },
        {
          label: 'Soy-free',
          value: 'soy-free'
        },
        {
          label: 'Sugar-conscious',
          value: 'sugar-conscious'
        },
        {
          label: 'Sulfite-free',
          value: 'sulfite-free'
        },
        {
          label: 'Tree-nut-free',
          value: 'tree-nut-free'
        },
        {
          label: 'Vegan',
          value: 'vegan'
        },
        {
          label: 'Vegetarian',
          value: 'vegetarian'
        },
        {
          label: 'Wheat-free',
          value: 'wheat-free'
        }
      ]
    },
    {
      label: 'Cuisine',
      value: 'cuisine-type',
      children: [
        {
          label: 'American',
          value: 'American'
        },
        {
          label: 'Asian',
          value: 'Asian'
        },
        {
          label: 'British',
          value: 'British'
        },
        {
          label: 'Caribbean',
          value: 'Caribbean'
        },
        {
          label: 'Central Europe',
          value: 'Central Europe'
        },
        {
          label: 'Chinese',
          value: 'Chinese'
        },
        {
          label: 'Eastern Europe',
          value: 'Eastern Europe'
        },
        {
          label: 'French',
          value: 'French'
        },
        {
          label: 'Indian',
          value: 'Indian'
        },
        {
          label: 'Italian',
          value: 'Italian'
        },
        {
          label: 'Japanese',
          value: 'Japanese'
        },
        {
          label: 'Mediterranean',
          value: 'Mediterranean'
        },
        {
          label: 'Mexican',
          value: 'Mexican'
        },
        {
          label: 'Middle Eastern',
          value: 'Middle Eastern'
        },
        {
          label: 'Nordic',
          value: 'Nordic'
        },
        {
          label: 'South American',
          value: 'South American'
        },
        {
          label: 'South East Asian',
          value: 'South East Asian'
        }
      ]
    },
    {
      label: 'Meal',
      value: 'meal-type',
      children: [
        {
          label: 'Breakfast',
          value: 'Breakfast'
        },
        {
          label: 'Dinner',
          value: 'Dinner'
        },
        {
          label: 'Lunch',
          value: 'Lunch'
        },
        {
          label: 'Snack',
          value: 'Snack'
        },
        {
          label: 'Teatime',
          value: 'Teatime'
        }
      ]
    },
    {
      label: 'Dish',
      value: 'dish-type',
      children: [
        {
          label: 'Biscuits and cookies',
          value: 'Biscuits-and-cookies'
        },
        {
          label: 'Bread',
          value: 'Bread'
        },
        {
          label: 'Cereals',
          value: 'Cereals'
        },
        {
          label: 'Condiments and sauces',
          value: 'Condiments-and-sauces'
        },
        {
          label: 'Desserts',
          value: 'Desserts'
        },
        {
          label: 'Drinks',
          value: 'Drinks'
        },
        {
          label: 'Main course',
          value: 'Main-course'
        },
        {
          label: 'Pancake',
          value: 'Pancake'
        },
        {
          label: 'Preps',
          value: 'Preps'
        },
        {
          label: 'Preserve',
          value: 'Preserve'
        },
        {
          label: 'Salad',
          value: 'Salad'
        },
        {
          label: 'Sandwiches',
          value: 'Sandwiches'
        },
        {
          label: 'Side dish',
          value: 'Side dish'
        },
        {
          label: 'Soup',
          value: 'Soup'
        },
        {
          label: 'Starter',
          value: 'Starter'
        },
        {
          label: 'Sweets',
          value: 'Sweets'
        }
      ]
    }
  ];

  return (
    <>
      <ContentTitle>Search recipes</ContentTitle>
      <ContentSubtitle>What do you want to cook?</ContentSubtitle>
      <Form
        initialValues={{ remember: true }}
        onSubmit={handleFormSubmit}
        autoComplete="off"
        {...formItemLayout}
        layout={'vertical'}
        //
      >
        <Form.Item rules={[{ required: true, message: 'Please input your query!' }]} style={{ marginBottom: '0.3rem' }}>
          <Input.Search
            name="q"
            type="text"
            id="q"
            value={formState.q}
            size="large"
            enterButton={true}
            loading={false}
            onChange={handleChange}
            onSearch={handleFormSubmit}
            //
          />
        </Form.Item>

        <Form.Item rules={[{ required: true, message: 'Please input your query!' }]}>
          <Cascader
            placeholder="Filters…"
            options={options}
            onChange={handleFilterChange}
            multiple
            maxTagCount="responsive"
            showCheckedStrategy={SHOW_CHILD}
            expandTrigger="hover"
            //
          />
        </Form.Item>
      </Form>

      <Space>
        <Divider />
        <RecipeCardContainer results={state.searchRecipes} loading={loadingEdamam} />
      </Space>
    </>
  );
}

export default App;
