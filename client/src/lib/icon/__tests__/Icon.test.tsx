import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { IngreIconSearch, IngreIconSpin, IngreIconSave, IngreIconPro } from '../Icon'

describe('Icon', () => {
  it('renders search icon without throwing', () => {
    expect(() => render(<IngreIconSearch />)).not.toThrow()
  })

  it('renders spin icon without throwing', () => {
    expect(() => render(<IngreIconSpin />)).not.toThrow()
  })

  it('renders save icon without throwing', () => {
    expect(() => render(<IngreIconSave />)).not.toThrow()
  })

  it('renders pro icon without throwing', () => {
    expect(() => render(<IngreIconPro />)).not.toThrow()
  })
})
