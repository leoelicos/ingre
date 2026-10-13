import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import {
  IngreIconSearch,
  IngreIconSpin,
  IngreIconSave,
  IngreIconPro,
  IngreIconCustomise,
  IngreIconIngredients,
  IngreIconTapOff,
  IngreIconLogoEgg
} from '../Icon'

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

  it('renders customise icon without throwing', () => {
    expect(() => render(<IngreIconCustomise />)).not.toThrow()
  })

  it('renders ingredients icon without throwing', () => {
    expect(() => render(<IngreIconIngredients />)).not.toThrow()
  })

  it('renders tapoff icon without throwing', () => {
    expect(() => render(<IngreIconTapOff />)).not.toThrow()
  })

  it('renders logo egg icon without throwing', () => {
    expect(() => render(<IngreIconLogoEgg />)).not.toThrow()
  })
})
