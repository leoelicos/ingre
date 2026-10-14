import type { ReactNode } from 'react'
import { Button as AriaButton } from 'react-aria-components'

type Props = {
  children: ReactNode
  onPress?: () => void
  isDisabled?: boolean
  /** When true, set aria-disabled but keep the button focusable (matches prior Bootstrap behaviour). */
  ariaDisabledOnly?: boolean
  ariaDescribedBy?: string
  className?: string
  id?: string
}

/** Primary action button matching the existing green pill/rounded look via design tokens. */
export const PrimaryButton = ({
  children,
  onPress,
  isDisabled,
  ariaDisabledOnly,
  ariaDescribedBy,
  className = '',
  id
}: Props) => (
  <AriaButton
    id={id}
    onPress={onPress}
    isDisabled={ariaDisabledOnly ? false : isDisabled}
    aria-describedby={ariaDescribedBy}
    aria-disabled={isDisabled || ariaDisabledOnly ? true : undefined}
    className={({ isFocusVisible }) =>
      [
        'inline-flex items-center justify-center min-h-[44px] px-4 rounded-control',
        'bg-primary text-on-primary font-semibold',
        'border border-primary',
        isDisabled || ariaDisabledOnly
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:brightness-95',
        isFocusVisible
          ? 'outline outline-2 outline-offset-2 outline-primary'
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
