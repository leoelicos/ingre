import { useT } from '../../i18n'
import type { FC } from 'react'
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover
} from 'react-aria-components'
import type { LibraryRecipe } from '../../types/library'
import { ACTION_BUTTON } from './Filters'

/**
 * A compact control beside Filter (#229): pick a recipe from a list and its ingredients fill the
 * Ingredients list. The same as ticking the recipe's row, for when you know its name. Recipes
 * already picked are listed but cannot be chosen again. Not a full-width button.
 */
export const PopulateFromRecipe: FC<{
  recipes: readonly LibraryRecipe[]
  pickedIds: ReadonlySet<string>
  onPick: (recipe: LibraryRecipe) => void
}> = ({ recipes, pickedIds, onPick }) => {
  const t = useT()
  return (
    <MenuTrigger>
      <Button className={ACTION_BUTTON}>{t('explore.fromRecipe')}</Button>
      <Popover
        placement="bottom start"
        className="max-h-72 min-w-[14rem] overflow-y-auto rounded-control border border-border bg-surface p-1 text-text shadow-card"
      >
        <Menu
          className="outline-none"
          disabledKeys={[...pickedIds]}
          onAction={(key) =>
            recipes.filter((recipe) => recipe.id === key).forEach(onPick)
          }
        >
          {recipes.map((recipe) => (
            <MenuItem
              key={recipe.id}
              id={recipe.id}
              textValue={recipe.name}
              className="flex min-h-[44px] cursor-pointer items-center rounded-control px-3 py-2 text-text outline-none data-[disabled]:cursor-default data-[disabled]:text-text-secondary data-[focused]:bg-chip-active"
            >
              {pickedIds.has(recipe.id)
                ? t('explore.fromRecipeAdded', { name: recipe.name })
                : recipe.name}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  )
}
