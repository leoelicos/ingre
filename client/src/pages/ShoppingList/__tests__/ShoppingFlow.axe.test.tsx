import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ShoppingFlow } from '../ShoppingFlow'
import { MockedProvider } from '@apollo/client/testing'

expect.extend(toHaveNoViolations)


const renderFlow = () =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter>
        <ShoppingFlow />
      </MemoryRouter>
    </MockedProvider>
  )

describe('ShoppingFlow accessibility (axe)', () => {
  it('has no axe violations on the Pick step', async () => {
    const { container } = renderFlow()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
