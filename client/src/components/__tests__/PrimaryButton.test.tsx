import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrimaryButton } from '../PrimaryButton'
import { primaryButtonClass, primaryLinkClass } from '../primaryButtonStyle'

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

describe('PrimaryButton options (#170)', () => {
  it('submits its form when type is submit, with the snug size and a label', () => {
    const onSubmit = jest.fn((e: { preventDefault: () => void }) =>
      e.preventDefault()
    )
    render(
      <form onSubmit={onSubmit}>
        <PrimaryButton
          type="submit"
          size="snug"
          ariaLabel="Send it"
        >
          Go
        </PrimaryButton>
      </form>
    )
    const btn = screen.getByRole('button', { name: 'Send it' })
    expect(btn).toHaveAttribute('type', 'submit')
    expect(btn.className).toMatch(/px-3/)
    fireEvent.click(btn)
    expect(onSubmit).toHaveBeenCalled()
  })

  it('uses the compact 44px height', () => {
    render(<PrimaryButton size="compact">Add</PrimaryButton>)
    expect(screen.getByRole('button', { name: 'Add' }).className).toMatch(
      /min-h-\[44px\]/
    )
  })
})

describe('primaryLinkClass', () => {
  it('matches the enabled button and keeps the focus-ring and hover colour', () => {
    const link = primaryLinkClass('snug')
    expect(link).toContain(primaryButtonClass('snug', false))
    expect(link).toContain('focus-visible:focus-ring')
    expect(link).toContain('hover:text-on-primary')
  })
})
