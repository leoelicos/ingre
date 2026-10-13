import { serverRecipe } from '../../../../test/fixtures'
import type { Recipe as ServerRecipe } from '../typedefs'
import { renderHook, act } from '@testing-library/react'
import { useSaveRecipe } from '../useSaveRecipe'
import { useUpdateRecipe } from '../updateRecipe'
import { StoreProvider } from '../../../../utils/state/GlobalState'

const mockHandlers: {
  onCompleted?:
    | ((data: {
        saveRecipe?: ServerRecipe
        updateRecipe?: { name: string }
      }) => void)
    | undefined
  onError?: ((error: Error) => void) | undefined
} = {}

jest.mock('@apollo/client', () => ({
  gql: (s: TemplateStringsArray) => s,
  useMutation: (
    _query: unknown,
    options: {
      onCompleted?: (data: {
        saveRecipe?: ServerRecipe
        updateRecipe?: { name: string }
      }) => void
      onError?: (error: Error) => void
    }
  ) => {
    mockHandlers.onCompleted = options.onCompleted
    mockHandlers.onError = options.onError
    return [jest.fn(), { loading: false, error: undefined }]
  }
}))

describe('recipe mutations', () => {
  it('logs save completion and errors', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    renderHook(() => useSaveRecipe(), { wrapper: StoreProvider })
    act(() => {
      mockHandlers.onCompleted?.({ saveRecipe: serverRecipe({ name: 'Pie' }) })
      mockHandlers.onError?.(new Error('save'))
    })
    expect(log).toHaveBeenCalled()
    expect(error).toHaveBeenCalled()
    log.mockRestore()
    error.mockRestore()
  })

  it('logs update completion and errors', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    renderHook(() => useUpdateRecipe())
    act(() => {
      mockHandlers.onCompleted?.({ updateRecipe: { name: 'Pie' } })
      mockHandlers.onError?.(new Error('update'))
    })
    expect(log).toHaveBeenCalled()
    expect(error).toHaveBeenCalled()
    log.mockRestore()
    error.mockRestore()
  })
})
