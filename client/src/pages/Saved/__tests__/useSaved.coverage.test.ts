import { renderHook } from '@testing-library/react'
import { useSaved } from '../useSaved'
import { recipe } from '../../../test/fixtures'
import type { ClientRecipe } from '../../../types/client'

const mockGetSavedRecipes = jest.fn()
const mockDispatch = jest.fn()
const mockStore: { savedRecipes: ClientRecipe[]; savedDidMount: boolean } = {
  savedRecipes: [],
  savedDidMount: false
}
const mockLazy: {
  loading: boolean
  error: Error | null
  data: { getSavedRecipes?: ClientRecipe[] } | null
} = { loading: false, error: null, data: null }

jest.mock('@apollo/client', () => ({
  useLazyQuery: () => [mockGetSavedRecipes, mockLazy],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [mockStore, mockDispatch]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('useSaved coverage', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockGetSavedRecipes.mockClear()
    mockStore.savedDidMount = true
    mockStore.savedRecipes = []
    mockLazy.loading = false
    mockLazy.error = null
    mockLazy.data = null
  })

  it('does not fetch again after the page has mounted', () => {
    renderHook(() => useSaved())
    expect(mockGetSavedRecipes).not.toHaveBeenCalled()
  })

  it('fetches on first mount and ignores incomplete results', () => {
    mockStore.savedDidMount = false
    mockLazy.loading = true
    const { rerender } = renderHook(() => useSaved())
    expect(mockGetSavedRecipes).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FLAG_SAVED_MOUNTED',
      data: undefined
    })

    mockLazy.loading = false
    mockLazy.error = new Error('nope')
    rerender()
    mockLazy.error = null
    mockLazy.data = {}
    rerender()
    mockLazy.data = { getSavedRecipes: [recipe()] }
    rerender()
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SAVED_RECIPES',
      data: [recipe()]
    })
  })
})
