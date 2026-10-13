import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Upgrade } from '../Upgrade'

jest.mock('../useUpgrade', () => ({
  useUpgrade: () => ({ pro: false, loggedIn: false, getCheckout: jest.fn() })
}))

jest.mock('../../../components/NotLoggedIn', () => () => <div>Not logged in</div>)

describe('Upgrade', () => {
  it('shows upgrade message when not logged in', () => {
    render(<Upgrade />)
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
  })

  it('shows pro message when user is pro', () => {
    jest.spyOn(require('../useUpgrade'), 'useUpgrade').mockReturnValue({ pro: true, loggedIn: true, getCheckout: jest.fn() })
    render(<Upgrade />)
    expect(screen.getByText(/you are pro/i)).toBeInTheDocument()
  })
})
