import type { ReactNode } from 'react'
import { Button as AriaButton } from 'react-aria-components'

type Props = {
  children: ReactNode
  onPress?: () => void
  isDisabled?: boolean
  /** When true, set aria-disabled but keep the button focusable. */
  ariaDisabledOnly?: boolean
  ariaDescribedBy?: string | undefined
  className?: string
  id?: string | undefined
}

const DISABLED_ARIA = true

/** Primary action button using design tokens. Focus ring is 3px green, offset 2px, only on focus-visible. */
export const PrimaryButton = ({
  children,
  onPress,
  isDisabled,
  ariaDisabledOnly,
  ariaDescribedBy,
  className = '',
  id
}: Props) => {
  const showAriaDisabled = Boolean(isDisabled || ariaDisabledOnly)
  const blocked = Boolean(isDisabled || ariaDisabledOnly)
  const handlePress = () => {
    if (blocked) return
    onPress?.()
  }
  return (
    <AriaButton
      {...(id !== undefined ? { id } : {})}
      onPress={handlePress}
      {...(ariaDisabledOnly
        ? {}
        : isDisabled !== undefined
        ? { isDisabled }
        : {})}
      {...(ariaDescribedBy !== undefined
        ? { 'aria-describedby': ariaDescribedBy }
        : {})}
      {...(showAriaDisabled ? { 'aria-disabled': DISABLED_ARIA } : {})}
      className={[
        'inline-flex items-center justify-center min-h-[48px] px-4 rounded-control',
        'font-normal border',
        'bg-primary text-on-primary border-primary',
        'focus-visible:focus-ring',
        'pressed:opacity-90',
        'disabled:bg-primary-disabled-bg disabled:text-primary-disabled-fg disabled:border-transparent disabled:cursor-not-allowed',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </AriaButton>
  )
}
