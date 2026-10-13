import { useEffect, useState } from 'react'
import type { ClientRecipe } from '../../types/client'
import searchLibrary from '../../utils/library/recipeLibrary'
import { changeTitle } from '../../utils/changeTitle'
import { useStoreContext } from '../../utils/state/GlobalState'
import { UPDATE_SEARCH_RECIPES } from '../../utils/state/actions'
import type {
  cuisineType,
  dietType,
  dishType,
  filterTypes,
  healthType,
  mealType
} from './filter.d'

const dietTypes: readonly dietType[] = [
  'balanced',
  'high-fiber',
  'high-protein',
  'low-carb',
  'low-fat',
  'low-sodium'
]
const healthTypes: readonly healthType[] = [
  'dairy-free',
  'egg-free',
  'fish-free',
  'gluten-free',
  'low-potassium',
  'low-sugar',
  'lupine-free',
  'Mediterranean',
  'mollusk-free',
  'mustard-free',
  'no-oil-added',
  'paleo',
  'peanut-free',
  'pescatarian',
  'pork-free',
  'red-meat-free',
  'sesame-free',
  'shellfish-free',
  'soy-free',
  'sugar-conscious',
  'sulfite-free',
  'tree-nut-free',
  'vegan',
  'vegetarian',
  'wheat-free'
]
const cuisineTypes: readonly cuisineType[] = [
  'American',
  'Asian',
  'British',
  'Caribbean',
  'Central Europe',
  'Chinese',
  'Eastern Europe',
  'French',
  'Indian',
  'Italian',
  'Japanese',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Nordic',
  'South American',
  'South East Asian'
]
const mealTypes: readonly mealType[] = ['Breakfast', 'Dinner', 'Lunch', 'Snack']
const dishTypes: readonly dishType[] = [
  'Biscuits-and-cookies',
  'Bread',
  'Cereals',
  'Condiments-and-sauces',
  'Desserts',
  'Drinks',
  'Main-course',
  'Pancake',
  'Preps',
  'Preserve',
  'Salad',
  'Sandwiches',
  'Side dish',
  'Soup',
  'Starter',
  'Sweets'
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOneOf<T extends string>(
  options: readonly T[],
  value: string
): value is T {
  for (const option of options) {
    if (option === value) return true
  }
  return false
}

export function buildFilterState(value: unknown): filterTypes {
  const next: filterTypes = {
    diet: [],
    health: [],
    cuisineType: [],
    mealType: [],
    dishType: []
  }
  if (!isRecord(value)) return next
  for (const key of Object.keys(value)) {
    const val = value[key]
    if (typeof val !== 'string') continue
    if (key === 'diet' && isOneOf(dietTypes, val)) next.diet.push(val)
    else if (key === 'health' && isOneOf(healthTypes, val))
      next.health.push(val)
    else if (key === 'cuisine-type' && isOneOf(cuisineTypes, val))
      next.cuisineType.push(val)
    else if (key === 'meal-type' && isOneOf(mealTypes, val))
      next.mealType.push(val)
    else if (key === 'dish-type' && isOneOf(dishTypes, val))
      next.dishType.push(val)
  }
  return next
}

type SearchHandlerType = (value: string, event?: { target?: unknown }) => void

export const useSearch = () => {
  const [state, dispatch] = useStoreContext()
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [libraryRecipes, setLibraryRecipes] = useState<ClientRecipe[]>(
    state.searchRecipes
  )
  const blankForm = {
    diet: [],
    health: [],
    cuisineType: [],
    mealType: [],
    dishType: []
  }
  const [updateRecipes, setUpdateRecipes] = useState(false)
  const [searchText, setSearchText] = useState<string>('')
  const [filterState, setFilterState] = useState<filterTypes>(blankForm)

  const handleFormSubmit: SearchHandlerType = async (q, event) => {
    if (!event) return
    try {
      setLoadingRecipes(true)
      const tags = [
        ...filterState.diet,
        ...filterState.health,
        ...filterState.cuisineType,
        ...filterState.mealType,
        ...filterState.dishType
      ]
      const hits = searchLibrary({ q, tags })
      setLibraryRecipes(hits)
      setUpdateRecipes(true)
      setLoadingRecipes(false)
    } catch (e) {
      console.error(e)
      setLoadingRecipes(false)
    }
  }

  const handleFilterChange = (event: { target: { value?: unknown } }) => {
    setFilterState(buildFilterState(event.target.value))
  }

  const onSearchChange = (e: { target: { value: string } }) => {
    setSearchText(e.target.value)
  }
  // Store results in global state
  useEffect(() => {
    if (updateRecipes) {
      dispatch({ type: UPDATE_SEARCH_RECIPES, data: libraryRecipes })
      setUpdateRecipes(false)
    }
  }, [updateRecipes, libraryRecipes, dispatch])

  useEffect(() => {
    changeTitle('Search')
  }, [])
  return {
    searchText,
    onSearchChange,
    loadingRecipes,
    libraryRecipes,
    handleFormSubmit,
    handleFilterChange
  }
}
