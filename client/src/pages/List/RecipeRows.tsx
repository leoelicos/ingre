import type { FC } from 'react'
import { useId, useState } from 'react'
import { Button, ToggleButton } from 'react-aria-components'
import { Chevron, Collapse, MOTION } from '../../components/Collapse'
import {
  KeyIngredientLines,
  keyNameIds
} from '../../components/IngredientBadge/KeyIngredients'
import { ServesPicker } from '../../components/ServesPicker'
import { SaveButton } from '../../components/Widgets/RecipeCard/components/SaveButton'
import { splitTitle } from '../../components/Widgets/RecipeCard/recipeCardHelpers'
import type { LibraryRecipe } from '../../types/library'
import { containsLine, recipeAllergens } from '../../utils/library/allergens'
import { keyIngredientsOf } from '../../utils/library/keyIngredients'
import { catalogue } from '../../utils/library/recipeLibrary'
import {
  TONE_CLASSES,
  sectionTone
} from '../../components/IngredientBadge/badgeTone'
import type { ShopLine } from '../../utils/shopping/shoppingList'
import {
  assumedNames,
  buildShoppingList,
  buyAmount,
  displayName
} from '../../utils/shopping/shoppingList'
import type { People } from '../../utils/storage/people'

/** What every row shares: picks, open rows, servings and whether Save is offered. */
export interface RowControls {
  readonly pickedIds: ReadonlySet<string>
  readonly onTogglePicked: (id: string) => void
  readonly openIds: ReadonlySet<string>
  readonly onToggleOpen: (id: string) => void
  readonly people: People
  readonly onPeople: (people: People) => void
  /** Save (the heart) shows only when signed in (#179) */
  readonly canSave: boolean
  /** Explore's rows open with a "See recipe" button; list rows with a chevron (#181) */
  readonly seeRecipe: boolean
}

/** The notes under the method: allergens and the staples assumed at home; empty when none. */
export const recipeNotes = (
  recipe: LibraryRecipe,
  people: People
): string[] => {
  const staples = buildShoppingList([recipe], people, catalogue).filter(
    (line) => line.staple
  )
  return [
    containsLine(recipeAllergens(recipe, catalogue)),
    staples.length === 0 ? '' : `You'll also need: ${assumedNames(staples)}`
  ].filter((note) => note !== '')
}

const HEADING = 'm-0 text-sm font-semibold uppercase tracking-wide'

/** An ingredient chip in an open row: read-only for now (#181), coloured by its category. */
const IngredientChip: FC<{ line: ShopLine }> = ({ line }) => (
  <li
    data-ingredient={line.ingredientId}
    className={`flex flex-col rounded-pill border bg-gradient-to-b from-white/50 to-white/0 px-3 py-1 leading-tight shadow-raised ${
      TONE_CLASSES[sectionTone(line.section)]
    }`}
  >
    <span className="font-semibold">{displayName(line)}</span>
    <span className="text-xs">{buyAmount(line)}</span>
  </li>
)

/** The expanded row: ingredients, servings, method, notes, and Save when signed in. */
const RecipeDetails: FC<{
  recipe: LibraryRecipe
  title: string
  controls: RowControls
}> = ({ recipe, title, controls }) => {
  const lines = buildShoppingList([recipe], controls.people, catalogue)
  const notes = recipeNotes(recipe, controls.people)
  return (
    <div className="flex flex-col gap-4 border-t border-border px-4 pb-4 pt-3 text-text">
      {controls.canSave && (
        <div className="flex items-center gap-2">
          <SaveButton
            recipeName={title}
            libraryId={recipe.id}
          />
          <span className="text-sm">Save</span>
        </div>
      )}
      <ServesPicker
        people={controls.people}
        onChange={controls.onPeople}
      />
      <div>
        <h3 className={HEADING}>Ingredients</h3>
        <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
          {lines.map((line) => (
            <IngredientChip
              key={line.ingredientId}
              line={line}
            />
          ))}
        </ul>
      </div>
      <div>
        <h3 className={HEADING}>Method</h3>
        <ol className="m-0 pl-5">
          {recipe.method.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      {notes.length > 0 && (
        <div>
          <h3 className={HEADING}>Notes</h3>
          {notes.map((note) => (
            <p
              key={note}
              className="m-0 text-sm"
            >
              {note}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

/** Raised when not picked; pressed in, with a border and a check mark, once picked. */
const rowClass = (picked: boolean): string =>
  `grid grid-cols-[1fr_auto] rounded-card border-2 bg-bg transition-shadow ${MOTION} ${
    picked
      ? 'border-primary shadow-pressed'
      : 'border-transparent shadow-raised'
  }`

/** The tick in a circle: filled once picked, an empty ring (3:1 against the row) before. */
const CheckMark: FC<{ picked: boolean }> = ({ picked }) => (
  <span
    aria-hidden="true"
    data-testid="row-check"
    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-pill border-2 text-sm font-bold ${
      picked
        ? 'border-primary bg-primary text-on-primary'
        : 'border-text-secondary'
    }`}
  >
    {picked ? '✓' : ''}
  </span>
)

/**
 * True once the row has been opened: details are built on first open (not for every row up
 * front) and then kept, so closing still animates.
 */
export const useShownOnce = (open: boolean): boolean => {
  const [shown, setShown] = useState(open)
  if (open && !shown) setShown(true)
  return shown || open
}

/**
 * One recipe row (#179): one tap anywhere selects or unselects it (a toggle button, so
 * VoiceOver reads "selected"); the chevron opens its details inline. No Add button.
 */
export const RecipeRow: FC<{
  recipe: LibraryRecipe
  controls: RowControls
}> = ({ recipe, controls }) => {
  const id = useId()
  const { title } = splitTitle(recipe.name)
  const items = keyIngredientsOf(recipe)
  const picked = controls.pickedIds.has(recipe.id)
  const open = controls.openIds.has(recipe.id)
  const detailsId = `${id}-details`
  const shown = useShownOnce(open)
  return (
    <li className={rowClass(picked)}>
      <ToggleButton
        isSelected={picked}
        onChange={() => controls.onTogglePicked(recipe.id)}
        aria-labelledby={`${id}-title`}
        aria-describedby={keyNameIds(id, items)}
        className="flex min-h-[44px] items-start gap-3 rounded-l-card p-4 text-left data-[focus-visible]:focus-ring"
      >
        <CheckMark picked={picked} />
        <span className="flex min-w-0 flex-col gap-2">
          <span
            id={`${id}-title`}
            className="text-lg font-semibold leading-snug text-text"
          >
            {title}
          </span>
          <KeyIngredientLines
            items={items}
            idPrefix={id}
          />
        </span>
      </ToggleButton>
      <Button
        aria-label={
          controls.seeRecipe ? `See recipe: ${title}` : `${title} details`
        }
        aria-expanded={open}
        aria-controls={detailsId}
        onPress={() => controls.onToggleOpen(recipe.id)}
        className="flex min-h-[44px] min-w-[44px] items-start justify-center gap-1 whitespace-nowrap rounded-r-card p-4 text-sm font-semibold text-text data-[focus-visible]:focus-ring"
      >
        {controls.seeRecipe && <span>See recipe</span>}
        <Chevron open={open} />
      </Button>
      <Collapse
        id={detailsId}
        open={open}
        className="col-span-2"
      >
        {shown && (
          <RecipeDetails
            recipe={recipe}
            title={title}
            controls={controls}
          />
        )}
      </Collapse>
    </li>
  )
}

/** The recipe rows: a single-column grid of rows, not cards. */
export const RecipeRows: FC<{
  recipes: readonly LibraryRecipe[]
  controls: RowControls
}> = ({ recipes, controls }) => (
  <ul className="m-0 grid list-none grid-cols-1 gap-4 p-1">
    {recipes.map((recipe) => (
      <RecipeRow
        key={recipe.id}
        recipe={recipe}
        controls={controls}
      />
    ))}
  </ul>
)
