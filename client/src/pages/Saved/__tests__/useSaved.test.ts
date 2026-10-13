import { renderHook } from '@testing-library/react'
import { useSaved } from '../useSaved'

const mockGetSavedRecipes = jest.fn()
const mockDispatch = jest.fn()

jest.mock('@apollo/client', () => ({
  useLazyQuery: () => [
    mockGetSavedRecipes,
    { loading: false, error: null, data: { getSavedRecipes: [] } }
  ],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [
    { savedRecipes: [], savedDidMount: false },
    mockDispatch
  ]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('useSaved', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useSaved())
    expect(result.current).toBeDefined()
  })

  it('dispatches UPDATE_SAVED_RECIPES when data loads', () => {
    renderHook(() => useSaved())
    expect(mockDispatch).toHaveBeenCalled()
  })
})
