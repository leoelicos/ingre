import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { IngreIconSearch, IngreIconSpin } from '../Icon'

describe('Icon', () => {
  it('renders search icon', () => {
    const { container } = render(<IngreIconSearch />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders spin icon', () => {
    const { container } = render(<IngreIconSpin />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
