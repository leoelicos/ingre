import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import {
  Icon,
  IngreIconAddIngredient,
  IngreIconChevronDown,
  IngreIconClearCustom,
  IngreIconClearSearch,
  IngreIconCustomise,
  IngreIconFormError,
  IngreIconHelp,
  IngreIconIngredients,
  IngreIconLogoEgg,
  IngreIconLogoMenuCollapsed,
  IngreIconPortion,
  IngreIconPro,
  IngreIconRecipe,
  IngreIconRemove,
  IngreIconSave,
  IngreIconSearch,
  IngreIconSpin,
  IngreIconTapOff,
  IngreIconUndoCustom
} from '../Icon'

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span>icon</span>
}))

describe('Icon', () => {
  it('renders every icon, including small and extra styles', () => {
    const icons = [
      <Icon icon={['fas', 'egg']} key="plain" />,
      <IngreIconLogoEgg key="egg" />,
      <IngreIconLogoMenuCollapsed key="menu" />,
      <IngreIconChevronDown key="chevron" />,
      <IngreIconRecipe key="recipe" />,
      <IngreIconSearch key="search" />,
      <IngreIconCustomise key="customise" />,
      <IngreIconIngredients key="ingredients" />,
      <IngreIconTapOff key="tap" />,
      <IngreIconPro key="pro" />,
      <IngreIconHelp key="help" />,
      <IngreIconSave key="save" />,
      <IngreIconSpin key="spin" />,
      <IngreIconPortion key="portion" />,
      <IngreIconClearSearch key="clear-search" />,
      <IngreIconAddIngredient key="add" />,
      <IngreIconRemove key="remove" />,
      <IngreIconFormError key="error" />,
      <IngreIconUndoCustom key="undo" />,
      <IngreIconClearCustom key="clear" />
    ]
    icons.forEach((icon) => {
      expect(() => render(icon)).not.toThrow()
    })
  })
})
