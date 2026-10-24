/** Shared primary-button look (#170): one source for PrimaryButton and primary links. */

/** Heights and side padding the app's primary buttons use. */
export type PrimarySize = 'regular' | 'snug' | 'compact'

const SIZE_CLASSES: Record<PrimarySize, string> = {
  regular: 'min-h-[48px] px-4',
  snug: 'min-h-[48px] px-3',
  compact: 'min-h-[44px] px-3'
}

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-control font-normal border'

const ENABLED_CLASS = 'bg-primary text-on-primary border-primary'

const DISABLED_CLASS =
  'bg-primary-disabled-bg text-primary-disabled-fg border-transparent cursor-not-allowed'

/** Classes for a primary button in the given state. */
export const primaryButtonClass = (
  size: PrimarySize,
  disabled: boolean
): string =>
  [
    BASE_CLASS,
    SIZE_CLASSES[size],
    disabled ? DISABLED_CLASS : ENABLED_CLASS
  ].join(' ')

/** The same look on a link (router Link or <a>), with the shared focus-ring. */
export const primaryLinkClass = (size: PrimarySize): string =>
  [
    primaryButtonClass(size, false),
    'no-underline hover:text-on-primary focus-visible:focus-ring'
  ].join(' ')
