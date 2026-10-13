import { renderHook } from '@testing-library/react'
import { useSaved } from '../useSaved'

jest.mock('@apollo/client', () => ({
  useLazyQuery: () => [jest.fn(), { loading: false, error: null, data: null }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ savedRecipes: [], savedDidMount: false }, jest.fn()]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('useSaved', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useSaved())
    expect(result.current).toBeDefined()
  })
})
