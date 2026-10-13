import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Customise from '../Customise'

jest.mock('../useCustomiseForm', () => ({
  useCustomiseForm: () => ({ fields: {}, onChange: jest.fn() })
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false }, jest.fn()]
}))

jest.mock('../../../components/NotLoggedIn', () => () => <div>Not logged in</div>)
jest.mock('../../../lib/apollo/graphQL/useSaveRecipe', () => ({ useSaveRecipe: () => [jest.fn()] }))
jest.mock('../../../lib/apollo/graphQL/updateRecipe', () => ({ useUpdateRecipe: () => [jest.fn()] }))

describe('Customise', () => {
  it('shows not logged in when unauthenticated', () => {
    render(<Customise />)
    expect(screen.getByText(/not logged in/i)).toBeInTheDocument()
  })
})
