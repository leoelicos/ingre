import { reducer, useGlobalReducer } from '../reducers'
import {
  ADD_SAVED_RECIPE,
  FLAG_HOME_MOUNTED,
  FLAG_INGREDIENTS_GENERATED,
  FLAG_SAVED_MOUNTED,
  REMOVE_SAVED_RECIPE,
  UPDATE_HOME_RECIPES,
  UPDATE_SAVED_INGREDIENTS,
  UPDATE_SAVED_RECIPES,
  UPDATE_SEARCH_RECIPES,
  UPDATE_TAP_OFF
} from '../actions'
import type { Store } from '../GlobalState'
import { recipe } from '../../../test/fixtures'
import { renderHook } from '@testing-library/react'

const initialState: Store = {
  modalVisible: false,
  leftSidebarCollapsed: false,
  searchRecipes: [],
  homeRecipes: [],
  savedRecipes: [],
  homeDidMount: false,
  savedIngredients: [],
  savedDidMount: false,
  ingredientsDidGenerate: false,
  tapOff: []
}

describe('reducer', () => {
  it('updates recipe lists only when the payload is a recipe list', () => {
    const recipes = [recipe()]
    expect(
      reducer(initialState, { type: UPDATE_SEARCH_RECIPES, data: recipes })
        .searchRecipes
    ).toEqual(recipes)
    expect(
      reducer(initialState, {
        type: UPDATE_SEARCH_RECIPES,
        data: [{ name: 'nope' }]
      }).searchRecipes
    ).toEqual([])
    expect(
      reducer(initialState, { type: UPDATE_HOME_RECIPES, data: recipes })
        .homeRecipes
    ).toEqual(recipes)
    expect(
      reducer(initialState, { type: UPDATE_HOME_RECIPES }).homeRecipes
    ).toEqual([])
  })

  it('updates saved recipes and treats undefined as an empty list', () => {
    const recipes = [recipe({ libraryId: 'saved' })]
    expect(
      reducer(initialState, { type: UPDATE_SAVED_RECIPES, data: recipes })
        .savedRecipes
    ).toEqual(recipes)
    expect(
      reducer(
        { ...initialState, savedRecipes: recipes },
        { type: UPDATE_SAVED_RECIPES, data: undefined }
      ).savedRecipes
    ).toEqual([])
    expect(
      reducer(initialState, { type: UPDATE_SAVED_RECIPES, data: 'nope' })
        .savedRecipes
    ).toEqual([])
  })

  it('updates saved ingredients and tap off lists', () => {
    expect(
      reducer(initialState, { type: UPDATE_SAVED_INGREDIENTS, data: ['a'] })
        .savedIngredients
    ).toEqual(['a'])
    expect(
      reducer(initialState, { type: UPDATE_SAVED_INGREDIENTS, data: undefined })
        .savedIngredients
    ).toEqual([])
    expect(
      reducer(initialState, { type: UPDATE_SAVED_INGREDIENTS, data: 'nope' })
        .savedIngredients
    ).toEqual([])
    expect(
      reducer(initialState, { type: UPDATE_TAP_OFF, data: [1] }).tapOff
    ).toEqual([1])
    expect(
      reducer(initialState, { type: UPDATE_TAP_OFF, data: 'nope' }).tapOff
    ).toEqual([])
  })

  it('adds a saved recipe once and ignores invalid payloads', () => {
    const first = recipe({ libraryId: 'a' })
    const added = reducer(initialState, { type: ADD_SAVED_RECIPE, data: first })
    expect(added.savedRecipes).toEqual([first])
    expect(
      reducer(added, {
        type: ADD_SAVED_RECIPE,
        data: recipe({ libraryId: 'a' })
      }).savedRecipes
    ).toHaveLength(1)
    expect(
      reducer(initialState, { type: ADD_SAVED_RECIPE, data: { name: 'x' } })
    ).toBe(initialState)
  })

  it('removes a saved recipe by library id', () => {
    const state = {
      ...initialState,
      savedRecipes: [recipe({ libraryId: 'keep' }), recipe()]
    }
    expect(
      reducer(state, { type: REMOVE_SAVED_RECIPE, data: 'ed1' }).savedRecipes
    ).toEqual([recipe({ libraryId: 'keep' })])
    expect(reducer(state, { type: REMOVE_SAVED_RECIPE, data: 4 })).toBe(state)
  })

  it('flags pages as mounted or generated', () => {
    expect(
      reducer(initialState, { type: FLAG_HOME_MOUNTED }).homeDidMount
    ).toBe(true)
    expect(
      reducer(initialState, { type: FLAG_SAVED_MOUNTED }).savedDidMount
    ).toBe(true)
    expect(
      reducer(initialState, { type: FLAG_INGREDIENTS_GENERATED })
        .ingredientsDidGenerate
    ).toBe(true)
  })

  it('returns the same state for an unknown action', () => {
    expect(reducer(initialState, { type: 'UNKNOWN' })).toBe(initialState)
  })
})

describe('useGlobalReducer', () => {
  it('starts from the provided state', () => {
    const { result } = renderHook(() => useGlobalReducer(initialState))
    expect(result.current[0]).toEqual(initialState)
  })
})
