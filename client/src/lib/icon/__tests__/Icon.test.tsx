import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { IngreIconSearch, IngreIconSpin } from '../Icon'

describe('Icon', () => {
  it('renders search icon', () => {
    const { container } = render(<IngreIconSearch />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders spin icon', () => {
    const { container } = render(<IngreIconSpin />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
