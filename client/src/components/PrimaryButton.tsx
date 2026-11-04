import type { ReactNode } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import type { PrimarySize } from './primaryButtonStyle'
import { primaryButtonClass } from './primaryButtonStyle'

type Props = {
  children: ReactNode
  onPress?: () => void
  isDisabled?: boolean
  /** When true, set aria-disabled but keep the button focusable. */
  ariaDisabledOnly?: boolean
  ariaLabel?: string
  className?: string
  /** 'submit' inside a form; defaults to 'button'. */
  type?: 'button' | 'submit'
  size?: PrimarySize
}

const DISABLED_ARIA = true

/** Primary action button using design tokens. Focus ring is 3px green, offset 2px, only on focus-visible. */
export const PrimaryButton = ({
  children,
  onPress,
  isDisabled,
  ariaDisabledOnly,
  ariaLabel,
  className = '',
  type = 'button',
  size = 'regular'
}: Props) => {
  const showAriaDisabled = Boolean(isDisabled || ariaDisabledOnly)
  const handlePress = () => {
    if (showAriaDisabled) return
    onPress?.()
  }
  return (
    <AriaButton
      type={type}
      onPress={handlePress}
      {...(ariaDisabledOnly
        ? {}
        : isDisabled !== undefined
        ? { isDisabled }
        : {})}
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
      {...(showAriaDisabled ? { 'aria-disabled': DISABLED_ARIA } : {})}
      className={({ isFocusVisible }) =>
        [
          primaryButtonClass(size, showAriaDisabled),
          isFocusVisible ? 'focus-ring' : '',
          className
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      {children}
    </AriaButton>
  )
}
