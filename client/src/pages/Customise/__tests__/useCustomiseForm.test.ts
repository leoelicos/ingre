import { renderHook, act } from '@testing-library/react'
import { useCustomiseForm } from '../useCustomiseForm'

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ customiseRecipe: { name: 'Test', ingredients: [{ name: 'salt' }] } }, jest.fn()]
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: true }, jest.fn()]
}))

describe('useCustomiseForm', () => {
  it('returns form state', () => {
    const { result } = renderHook(() => useCustomiseForm({ updateRecipe: jest.fn(), saveRecipe: jest.fn() }))
    expect(result.current).toBeDefined()
    expect(result.current.name).toBe('Test')
  })

  it('onNameChange updates name', () => {
    const { result } = renderHook(() => useCustomiseForm({ updateRecipe: jest.fn(), saveRecipe: jest.fn() }))
    act(() => {
      result.current.onNameChange({ target: { value: 'New Name' } } as any)
    })
    expect(result.current.name).toBe('New Name')
  })
})
