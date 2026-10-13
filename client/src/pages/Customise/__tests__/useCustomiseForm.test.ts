import { renderHook } from '@testing-library/react'
import { useCustomiseForm } from '../useCustomiseForm'
  useNavigate: () => jest.fn()
}))
import { useCustomiseForm } from '../useCustomiseForm'

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ customiseRecipe: { name: 'Test', ingredients: [] } }, jest.fn()]
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: true }, jest.fn()]
}))

describe('useCustomiseForm', () => {
  it('returns form state', () => {
    const { result } = renderHook(() => useCustomiseForm({ updateRecipe: jest.fn(), saveRecipe: jest.fn() }))
    expect(result.current).toBeDefined()
  })
})
