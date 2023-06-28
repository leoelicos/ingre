import React, { FC } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

const Icon: FC<{ icon: string }> = ({ icon }) => {
  return (
    <FontAwesomeIcon
      icon={icon as IconProp}
      style={{
        width: '19.19px'
      }}
    />
  )
}

/* sidebar */
export const IngreIconRecipe = () => <Icon icon="fa-solid fa-cookie" />

export const IngreIconSearch = () => (
  <Icon icon="fa-solid fa-magnifying-glass" />
)

export const IngreIconCustomise = () => <Icon icon="fa-solid fa-pen" />

export const IngreIconIngredients = () => <Icon icon="fa-solid fa-egg" />

export const IngreIconTapOff = () => <Icon icon="fa-solid fa-square-check" />

export const IngreIconPro = () => <Icon icon="fa-solid fa-star" />

export const IngreIconHelp = () => <Icon icon="fa-solid fa-circle-info" />

/* recipe, search */
export const IngreIconSave = () => <Icon icon="fa-solid fa-save" />

/* search */
export const IngreIconClearSearch = () => (
  <Icon icon="fa-solid fa-circle-xmark" />
)

/* customise */
export const IngreIconAddIngredient = () => <Icon icon="fa-solid fa-add" />

export const IngreIconRemoveIngredient = () => <Icon icon="fa-solid fa-trash" />

export const IngreIconFormError = () => <Icon icon="fa-solid fa-exclamation" />
