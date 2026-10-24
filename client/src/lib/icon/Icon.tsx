import type { CSSProperties, FC } from 'react'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const Icon: FC<{
  icon: IconProp
  extraStyle?: CSSProperties
  small?: boolean
}> = ({ icon, extraStyle, small }) => {
  let style: CSSProperties = {}
  if (small) style.width = '22px'
  if (extraStyle) style = { ...style, ...extraStyle }
  return (
    <FontAwesomeIcon
      icon={icon}
      style={style}
    />
  )
}

/* header */
// Egg-and-tick brand mark (public/images/ingre-icon.svg). Decorative: the
// header link already carries the 'ingré' wordmark text.
export const IngreIconLogoEgg = () => (
  <img
    src="/images/ingre-icon.svg"
    alt=""
    aria-hidden="true"
    width={32}
    height={32}
    style={{ height: '2rem', width: '2rem' }}
  />
)

export const IngreIconLogoMenuCollapsed = () => (
  <Icon
    icon={['fas', 'bars']}
    extraStyle={{ fontSize: '20px', width: '20px' }}
  />
)
export const IngreIconChevronDown = () => (
  <Icon
    icon={['fas', 'chevron-down']}
    small={true}
  />
)

/* sidebar */
export const IngreIconRecipe = () => (
  <Icon
    icon={['fas', 'cookie']}
    small={true}
  />
)

export const IngreIconSearch = () => (
  <Icon
    icon={['fas', 'magnifying-glass']}
    small={true}
  />
)

export const IngreIconIngredients = () => (
  <Icon
    icon={['fas', 'egg']}
    small={true}
  />
)

export const IngreIconTapOff = () => (
  <Icon
    icon={['fas', 'square-check']}
    small={true}
  />
)

export const IngreIconPro = () => (
  <Icon
    icon={['fas', 'star']}
    small={true}
  />
)

export const IngreIconHelp = () => (
  <Icon
    icon={['fas', 'circle-info']}
    small={true}
  />
)

/* recipe, search */
export const IngreIconSave = () => (
  <Icon
    icon={['fas', 'save']}
    small={true}
  />
)
export const IngreIconSpin = () => (
  <Icon
    icon={['fas', 'spinner']}
    small={true}
  />
)

export const IngreIconPortion = () => (
  <Icon
    icon={['fas', 'user-group']}
    extraStyle={{
      borderRadius: '50%',
      padding: '0 4px 0',
      color: 'var(--color-text-strong)'
    }}
    small={true}
  />
)

/* search */
export const IngreIconClearSearch = () => (
  <Icon
    icon={['fas', 'circle-xmark']}
    small={true}
  />
)

/* ingredients */
/* shopping list */
export const IngreIconLocation = () => <Icon icon={['fas', 'location-dot']} />
export const IngreIconServes = () => <Icon icon={['fas', 'user-group']} />
export const IngreIconAccount = () => <Icon icon={['fas', 'circle-user']} />
