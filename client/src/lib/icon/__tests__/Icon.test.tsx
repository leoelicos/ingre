import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import {
  Icon,
  IngreIconChevronDown,
  IngreIconClearSearch,
  IngreIconHelp,
  IngreIconIngredients,
  IngreIconBasket,
  IngreIconHouse,
  IngreIconLocation,
  IngreIconLogoEgg,
  IngreIconLogoMenuCollapsed,
  IngreIconPortion,
  IngreIconPro,
  IngreIconRecipe,
  IngreIconSave,
  IngreIconSearch,
  IngreIconSpin,
  IngreIconTapOff
} from '../Icon'

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span>icon</span>
}))

describe('Icon', () => {
  it('renders every icon, including small and extra styles', () => {
    const icons = [
      <Icon
        icon={['fas', 'egg']}
        key="plain"
      />,
      <IngreIconHouse key="house" />,
      <IngreIconBasket key="basket" />,
      <IngreIconLocation key="location" />,
      <IngreIconLogoEgg key="egg" />,
      <IngreIconLogoMenuCollapsed key="menu" />,
      <IngreIconChevronDown key="chevron" />,
      <IngreIconRecipe key="recipe" />,
      <IngreIconSearch key="search" />,
      <IngreIconIngredients key="ingredients" />,
      <IngreIconTapOff key="tap" />,
      <IngreIconPro key="pro" />,
      <IngreIconHelp key="help" />,
      <IngreIconSave key="save" />,
      <IngreIconSpin key="spin" />,
      <IngreIconPortion key="portion" />,
      <IngreIconClearSearch key="clear-search" />
    ]
    icons.forEach((icon) => {
      expect(() => render(icon)).not.toThrow()
    })
  })
})
