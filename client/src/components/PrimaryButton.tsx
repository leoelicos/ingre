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
      className={({ isFocusVisible }) =>
        [
          'inline-flex items-center justify-center min-h-[48px] px-4 rounded-control',
          'font-semibold border',
          showAriaDisabled
            ? 'bg-primary-disabled text-on-primary-disabled border-transparent cursor-not-allowed'
            : 'bg-primary text-on-primary border-primary',
          isFocusVisible
            ? 'outline outline-[3px] outline-offset-2 outline-primary'
            : '',
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
