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
export const IngreIconLogoEgg = () => (
  <Icon
    icon={['fas', 'egg']}
    extraStyle={{
      marginRight: '0.3rem',
      color: 'var(--ingre-eggshell)',
      fontSize: '1.8rem',
      paddingBottom: '2px'
    }}
  />
)

export const IngreIconLogoMenuCollapsed = () => <Icon icon={['fas', 'bars']} />
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

export const IngreIconCustomise = () => (
  <Icon
    icon={['fas', 'pen']}
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
      color: 'black'
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

/* customise */
export const IngreIconAddIngredient = () => (
  <Icon
    icon={['fas', 'add']}
    small={true}
  />
)

export const IngreIconRemove = () => (
  <Icon
    icon={['fas', 'trash']}
    small={true}
  />
)

export const IngreIconFormError = () => (
  <Icon
    icon={['fas', 'exclamation']}
    small={true}
  />
)

export const IngreIconUndoCustom = () => (
  <Icon
    icon={['fas', 'rotate-left']}
    small={true}
  />
)

export const IngreIconClearCustom = () => (
  <Icon
    icon={['fas', 'eraser']}
    small={true}
  />
)
