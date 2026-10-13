import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import Upgrade from '../Upgrade'

const mockGetCheckout = jest.fn()
const mockUpgrade = {
  pro: false,
  loggedIn: true,
  getCheckout: mockGetCheckout
}

jest.mock('../useUpgrade', () => ({
  useUpgrade: () => mockUpgrade
}))

describe('Upgrade checkout', () => {
  it('starts checkout for a logged-in visitor', () => {
    render(<Upgrade />)
    fireEvent.click(
      screen.getByRole('button', { name: /checkout with stripe/i })
    )
    expect(mockGetCheckout).toHaveBeenCalled()
    expect(screen.getByText(/why upgrade/i)).toBeInTheDocument()
  })
})
