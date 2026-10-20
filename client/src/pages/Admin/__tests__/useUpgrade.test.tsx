import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { CHECKOUT, GET_USER } from '../../../lib/apollo/graphQL/queries'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { useUpgrade } from '../useUpgrade'

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider
    mocks={[
      { request: { query: GET_USER }, error: new Error('offline') },
      {
        request: { query: CHECKOUT },
        result: { data: { checkout: { session: 'cs_test_2' } } }
      }
    ]}
    addTypename={false}
  >
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  </MockedProvider>
)

describe('useUpgrade', () => {
  it('stays not-pro when the user query fails, and logs when Stripe.js gives nothing', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const load = jest.fn(() => Promise.resolve(null))
    const { result } = renderHook(() => useUpgrade(load), { wrapper })
    expect(result.current.loggedIn).toBe(false)
    act(() => {
      result.current.getCheckout()
    })
    await waitFor(() => {
      expect(error).toHaveBeenCalledWith('Error: No response from Stripe')
    })
    expect(result.current.pro).toBe(false)
    error.mockRestore()
  })
})
