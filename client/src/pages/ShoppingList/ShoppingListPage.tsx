import type { FC } from 'react'
import { SavedRecipesGate } from './SavedRecipesGate'
import { ShoppingListView } from './ShoppingListView'

export const ShoppingListPage: FC = () => (
  <SavedRecipesGate title="Shopping list">
    {(recipes) => <ShoppingListView recipes={recipes} />}
  </SavedRecipesGate>
)
