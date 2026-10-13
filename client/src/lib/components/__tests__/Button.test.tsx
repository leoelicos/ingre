import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button/Button'

describe('Button', () => {
  it('renders children and handles click', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Click me')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })
})
