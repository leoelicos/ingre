import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrimaryButton } from '../PrimaryButton'

describe('PrimaryButton', () => {
  it('calls onPress when enabled', () => {
    const onPress = jest.fn()
    render(<PrimaryButton onPress={onPress}>Go</PrimaryButton>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onPress).toHaveBeenCalled()
  })

  it('does not call onPress when ariaDisabledOnly', () => {
    const onPress = jest.fn()
    render(
      <PrimaryButton
        onPress={onPress}
        isDisabled
        ariaDisabledOnly
      >
        Next
      </PrimaryButton>
    )
    const btn = screen.getByRole('button', { name: 'Next' })
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(btn)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('is focusable and uses the 48px min height token', () => {
    render(<PrimaryButton>Focus me</PrimaryButton>)
    const btn = screen.getByRole('button', { name: 'Focus me' })
    btn.focus()
    expect(btn).toHaveFocus()
    expect(btn.className).toMatch(/min-h-\[48px\]/)
  })
})
