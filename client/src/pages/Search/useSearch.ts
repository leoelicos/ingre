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

/** Returns `[value[key]]` when it is one of `options`, otherwise `[]`. */
export function pickOption<T extends string>(
  value: Record<string, unknown>,
  key: string,
  options: readonly T[]
): T[] {
  const candidate = value[key]
  return options.filter((option) => option === candidate)
}

export const emptyFilterState = (): filterTypes => ({
  diet: [],
  health: [],
  cuisineType: [],
  mealType: [],
  dishType: []
})

export function buildFilterState(value: unknown): filterTypes {
  if (!isRecord(value)) return emptyFilterState()
  return {
    diet: pickOption(value, 'diet', dietTypes),
    health: pickOption(value, 'health', healthTypes),
    cuisineType: pickOption(value, 'cuisine-type', cuisineTypes),
    mealType: pickOption(value, 'meal-type', mealTypes),
    dishType: pickOption(value, 'dish-type', dishTypes)
  }
}

/** Flattens every selected filter into a single tag list. */
export const filterTags = (filter: filterTypes): string[] => [
  ...filter.diet,
  ...filter.health,
  ...filter.cuisineType,
  ...filter.mealType,
  ...filter.dishType
]

type SearchHandlerType = (value: string, event?: { target?: unknown }) => void

/** Finds recipes for a query and tags; the real one searches the local library. */
export type SearchFn = (search: { q: string; tags: string[] }) => ClientRecipe[]

export const useSearch = (search: SearchFn = searchLibrary) => {
  const [state, dispatch] = useStoreContext()
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [libraryRecipes, setLibraryRecipes] = useState<ClientRecipe[]>(
    state.searchRecipes
  )
  const [updateRecipes, setUpdateRecipes] = useState(false)
  const [searchText, setSearchText] = useState<string>('')
  const [filterState, setFilterState] = useState<filterTypes>(emptyFilterState)

  const handleFormSubmit: SearchHandlerType = async (q, event) => {
    if (!event) return
    try {
      setLoadingRecipes(true)
      const hits = search({ q, tags: filterTags(filterState) })
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
