import { renderHook, act } from '@testing-library/react'
import { useCustomiseForm } from '../useCustomiseForm'
import { recipe } from '../../../test/fixtures'
import type { ClientRecipe } from '../../../types/client'

const mockNavigate = jest.fn()
const mockState: { customiseRecipe: ClientRecipe | null } = {
  customiseRecipe: null
}

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [mockState, jest.fn()]
}))

describe('useCustomiseForm coverage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockState.customiseRecipe = null
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('edits fields, undoes, clears, and saves a new recipe', async () => {
    const saveRecipe = jest.fn()
    const updateRecipe = jest.fn()
    const { result } = renderHook(() =>
      useCustomiseForm({ updateRecipe, saveRecipe })
    )

    act(() => {
      result.current.onNameChange({ target: { value: 'Pie' } })
      result.current.onPortionsChange({ target: { value: '4' } })
      result.current.onIngredientsChange({
        idx: 0,
        newObject: { name: 'Salt' }
      })
      result.current.onIngredientsChange({ idx: 0, newObject: { quantity: 3 } })
      result.current.onIngredientsChange({
        idx: 0,
        newObject: { measure: 'g' }
      })
      result.current.onIngredientsChange({
        idx: 0,
        newObject: { category: 'spice' }
      })
      result.current.onIngredientsChange({
        idx: 3,
        newObject: { name: 'ignored' }
      })
      result.current.onAddIngredient()
    })
    expect(result.current.name).toBe('Pie')
    expect(result.current.portions).toBe(4)
    expect(result.current.ingredients).toHaveLength(2)

    act(() => {
      result.current.onDeleteIngredient({ idx: 1 })
      result.current.handleClearAll()
    })
    expect(result.current.name).toBe('')

    mockState.customiseRecipe = recipe({ name: 'Original', _id: undefined })
    act(() => {
      result.current.handleUndoAll()
    })
    expect(result.current.name).toBe('Original')

    await act(async () => {
      await result.current.onFinish()
    })
    expect(saveRecipe).toHaveBeenCalled()
    expect(updateRecipe).not.toHaveBeenCalled()
    expect(result.current.saved).toBe(true)
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current.saved).toBe(false)
  })

  it('updates an existing recipe and fills empty defaults', async () => {
    mockState.customiseRecipe = recipe({
      _id: 'saved-id',
      picture_url: '',
      edamamId: undefined
    })
    const saveRecipe = jest.fn()
    const updateRecipe = jest.fn()
    const { result } = renderHook(() =>
      useCustomiseForm({ updateRecipe, saveRecipe })
    )
    act(() => {
      result.current.onPortionsChange({ target: { value: '' } })
      result.current.onIngredientsChange({ idx: 0, newObject: { quantity: 0 } })
    })
    await act(async () => {
      await result.current.onFinish()
    })
    expect(updateRecipe).toHaveBeenCalledWith({
      variables: {
        recipeId: 'saved-id',
        input: expect.objectContaining({
          name: 'Custom recipe',
          portions: 1,
          edamamId: '-1'
        })
      }
    })
    expect(saveRecipe).not.toHaveBeenCalled()
  })

  it('does not save after cancel and logs save failures', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const saveRecipe = jest.fn(() => {
      throw new Error('nope')
    })
    const { result } = renderHook(() =>
      useCustomiseForm({ updateRecipe: jest.fn(), saveRecipe })
    )
    await act(async () => {
      await result.current.onFinish()
    })
    expect(error).toHaveBeenCalled()

    act(() => {
      result.current.handleBack()
    })
    expect(mockNavigate).toHaveBeenCalledWith(-1)
    saveRecipe.mockClear()
    await act(async () => {
      await result.current.onFinish()
    })
    expect(saveRecipe).not.toHaveBeenCalled()
    mockState.customiseRecipe = null
    act(() => {
      result.current.handleUndoAll()
    })
    expect(result.current.name).toBe('')
    error.mockRestore()
  })
})
