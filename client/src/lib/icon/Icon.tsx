import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { CSSProperties, FC } from 'react'

export const Icon: FC<{ icon: string; extraStyle?: any; small?: boolean }> = ({
  icon,
  extraStyle,
  small
}) => {
  let style: CSSProperties = {}
  if (small) style.width = '22px'
  if (extraStyle) style = { ...style, ...extraStyle }
  return (
    <FontAwesomeIcon
      icon={icon as IconProp}
      style={style}
    />
  )
}

/* header */
export const IngreIconLogoEgg = () => (
  <Icon
    icon="fa-solid fa-egg"
    extraStyle={{
      marginRight: '0.3rem',
      color: 'var(--ingre-eggshell)',
      fontSize: '1.8rem',
      paddingBottom: '2px'
    }}
  />
)

export const IngreIconLogoMenuCollapsed = () => <Icon icon="fa-solid fa-bars" />
export const IngreIconChevronDown = () => (
  <Icon
    icon="fa-solid fa-chevron-down"
    small={true}
  />
)

/* sidebar */
export const IngreIconRecipe = () => (
  <Icon
    icon="fa-classic fa-cookie"
    small={true}
  />
)

export const IngreIconSearch = () => (
  <Icon
    icon="fa-solid fa-magnifying-glass"
    small={true}
  />
)

export const IngreIconCustomise = () => (
  <Icon
    icon="fa-solid fa-pen"
    small={true}
  />
)

export const IngreIconIngredients = () => (
  <Icon
    icon="fa-solid fa-egg"
    small={true}
  />
)

export const IngreIconTapOff = () => (
  <Icon
    icon="fa-solid fa-square-check"
    small={true}
  />
)

export const IngreIconPro = () => (
  <Icon
    icon="fa-solid fa-star"
    small={true}
  />
)

export const IngreIconHelp = () => (
  <Icon
    icon="fa-solid fa-circle-info"
    small={true}
  />
)

/* recipe, search */
export const IngreIconSave = () => (
  <Icon
    icon="fa-solid fa-save"
    small={true}
  />
)
export const IngreIconSpin = () => (
  <Icon
    icon="fa-solid fa-spinner"
    small={true}
  />
)

export const IngreIconPortion = () => (
  <Icon
    icon="fa-solid fa-user-group"
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
    icon="fa-solid fa-circle-xmark"
    small={true}
  />
)

/* customise */
export const IngreIconAddIngredient = () => (
  <Icon
    icon="fa-solid fa-add"
    small={true}
  />
)

export const IngreIconRemove = () => (
  <Icon
    icon="fa-solid fa-trash"
    small={true}
  />
)

export const IngreIconFormError = () => (
  <Icon
    icon="fa-solid fa-exclamation"
    small={true}
  />
)

export const IngreIconUndoCustom = () => (
  <Icon
    icon="fa-solid fa-rotate-left"
    small={true}
  />
)

export const IngreIconClearCustom = () => (
  <Icon
    icon="fa-solid fa-eraser"
    small={true}
  />
)
