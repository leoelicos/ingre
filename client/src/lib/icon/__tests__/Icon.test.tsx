import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import {
  Icon,
  IngreIconChevronDown,
  IngreIconClearSearch,
  IngreIconHelp,
  IngreIconIngredients,
  IngreIconLocation,
  IngreIconLogoEgg,
  IngreIconServes,
  IngreIconLogoMenuCollapsed,
  IngreIconPortion,
  IngreIconPro,
  IngreIconRecipe,
  IngreIconSave,
  IngreIconSearch,
  IngreIconSpin,
  IngreIconTapOff
} from '../Icon'

import { addFontAwesome } from '../../../utils/addFontAwesome'

/* The real Font Awesome renderer, with the app's icon library loaded as App.tsx does. */
addFontAwesome()

describe('Icon', () => {
  it('renders every icon, including small and extra styles', () => {
    const icons = [
      <Icon
        icon={['fas', 'egg']}
        key="plain"
      />,
      <IngreIconLocation key="location" />,
      <IngreIconLogoEgg key="egg" />,
      <IngreIconServes key="serves" />,
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
    const error = jest.spyOn(console, 'error')
    icons.forEach((icon) => {
      const { container } = render(icon)
      expect(container.querySelector('svg, img')).not.toBeNull()
    })
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })
})
