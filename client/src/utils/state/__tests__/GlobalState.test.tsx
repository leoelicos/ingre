import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import { StoreProvider, useStoreContext } from '../GlobalState'
import { FLAG_HOME_MOUNTED } from '../actions'

function Probe() {
  const [state, dispatch] = useStoreContext()
  return (
    <button
      onClick={() => {
        dispatch({ type: FLAG_HOME_MOUNTED })
      }}
    >
      {String(state.homeDidMount)}
    </button>
  )
}

describe('GlobalState', () => {
  it('provides the store and a dispatch', () => {
    render(
      <StoreProvider>
        <Probe />
      </StoreProvider>
    )
    expect(screen.getByRole('button')).toHaveTextContent('false')
    act(() => {
      screen.getByRole('button').click()
    })
    expect(screen.getByRole('button')).toHaveTextContent('true')
  })

  it('reads the default context outside a provider', () => {
    render(<Probe />)
    expect(screen.getByRole('button')).toHaveTextContent('false')
    act(() => {
      screen.getByRole('button').click()
    })
    expect(screen.getByRole('button')).toHaveTextContent('false')
  })
})
