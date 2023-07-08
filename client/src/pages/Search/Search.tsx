/* react */
import React, { FC, useEffect, useState } from 'react'

/* components */
import { Form, Input, Cascader, Row, Spin, Divider, Col } from 'antd'
import RecipeCardContainer from '../../components/Recipe/RecipeCardContainer.tsx'
import ContentTitle from '../../components/Text/ContentTitle.tsx'

/* data */
import fetchEdamam from '../../utils/api/edamam.ts'
import { GET_API_KEY } from '../../lib/apolloClient/graphQL/queries.ts'
import { useApolloClient } from '@apollo/client'

/* state */
import { useStoreContext } from '../../utils/state/GlobalState.tsx'
import { UPDATE_SEARCH_RECIPES } from '../../utils/state/actions.ts'

/* hooks */
import { changeTitle } from '../../utils/changeTitle.ts'

/* types */
import type {
  cuisineType,
  dietType,
  dishType,
  filterTypes,
  healthType,
  mealType
} from './filter.d.ts'

// Ant subcomponents
const { SHOW_CHILD } = Cascader

type SearchHandlerType = (
  value: string,
  event?:
    | React.ChangeEvent<HTMLInputElement>
    | React.MouseEvent<HTMLElement>
    | React.KeyboardEvent<HTMLInputElement>
) => void

const Search: FC = () => {
  changeTitle('Search')

  const client = useApolloClient()

  // Global state
  const [state, dispatch] = useStoreContext()

  // Local state
  const [loadingEdamam, setLoadingEdamam] = useState(false)
  const [edamamRecipes, setEdamamRecipes] = useState(state.searchRecipes)
  const blankForm = {
    diet: [],
    health: [],
    cuisineType: [],
    mealType: [],
    dishType: []
  }
  const [formState, setFormState] = useState<filterTypes>(blankForm)
  const [updateRecipes, setUpdateRecipes] = useState(false)

  // Ant Form hook to enable setFormFields()
  const [form] = Form.useForm()

  const handleFormSubmit: SearchHandlerType = async (q, event) => {
    if (!event) return
    // console.log({ q, formState })
    try {
      // prevent API call when Ant.Search form is cleared with the 'x' button
      if (event.type === 'click' && event.currentTarget.tagName === 'INPUT')
        return

      // loading status on
      setLoadingEdamam(true)

      // Apollo Query to get Edamam API credentials
      const res = await client.query({ query: GET_API_KEY })
      if (!res) throw new Error('[handleRefresh] GET_API_KEY error')

      // Call API
      const search = { ...formState, q }
      const appId = res.data.getApiKey.appId
      const appKey = res.data.getApiKey.appKey
      // console.log({ search })
      const hits = await fetchEdamam({ search, appId, appKey })

      // Store results in local state
      setEdamamRecipes(hits)
      setUpdateRecipes(true)

      // Unflag API fetch
      setLoadingEdamam(false)
    } catch (e) {
      console.error(e)
    }
  }

  // Store results in global state
  useEffect(() => {
    if (updateRecipes) {
      dispatch({ type: UPDATE_SEARCH_RECIPES, data: edamamRecipes })
      setUpdateRecipes(false)
    }
  }, [updateRecipes, edamamRecipes, dispatch])

  /* bug: cannot assign type to 'event' */
  const handleFilterChange = (event: any) => {
    console.log({ event, type: typeof event })
    const newState = event.reduce(
      (accumulator: filterTypes, curr: string[]) => {
        let key = curr[0]
        let val = curr[1]
        if (key === 'diet') accumulator.diet.push(val as dietType)
        else if (key === 'health') accumulator.health.push(val as healthType)
        else if (key === 'cuisine-type')
          accumulator.cuisineType.push(val as cuisineType)
        else if (key === 'meal-type') accumulator.mealType.push(val as mealType)
        else if (key === 'dish-type') accumulator.dishType.push(val as dishType)
        return accumulator
      },
      {
        diet: [],
        health: [],
        cuisineType: [],
        mealType: [],
        dishType: []
      }
    )
    // console.log('newState', newState);
    setFormState(newState)
  }

  return (
    <Col style={{ width: '100%' }}>
      <Row>
        <ContentTitle>Search</ContentTitle>
      </Row>
      <Row>
        <Form
          form={form}
          initialValues={{ remember: true }}
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
              multiple={true}
              placeholder="Filters…"
              options={options}
              onChange={handleFilterChange}
              allowClear={true}
              maxTagCount="responsive"
              showCheckedStrategy={SHOW_CHILD}
              expandTrigger="hover"
              dropdownClassName="dropdownFilter"
              style={{ width: 'calc(100% - 64px)' }}
            />
          </Form.Item>
        </Form>
      </Row>
      <Row>
        {loadingEdamam ? (
          <Divider>
            <Spin tip="Loading…"></Spin>
          </Divider>
        ) : (
          <RecipeCardContainer
            results={edamamRecipes}
            loading={loadingEdamam}
            onSavedPage={false}
          />
        )}
      </Row>
    </Col>
  )
}

export default Search

const options = [
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
      {
        label: 'Biscuits and cookies',
        value: 'Biscuits-and-cookies'
      },
      { label: 'Bread', value: 'Bread' },
      { label: 'Cereals', value: 'Cereals' },
      {
        label: 'Condiments and sauces',
        value: 'Condiments-and-sauces'
      },
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
]
