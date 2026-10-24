import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { Group, Input, Label, NumberField } from 'react-aria-components'
import { SaveButton } from '../../components/SaveButton'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import type { CopyLine, RecipeCopy } from '../../utils/balance/copies'
import {
  MAX_PORTIONS,
  MIN_PORTIONS,
  copyLines,
  customisationBullets,
  newCopy,
  saveInput,
  usedLines
} from '../../utils/balance/copies'
import type { Chip, CopyEntry } from '../../utils/chips/chips'
import { startSection } from '../../utils/chips/chips'
import type { ChipsState } from '../../utils/chips/useChips'
import { containsLine, itemsAllergens } from '../../utils/library/allergens'
import { catalogue } from '../../utils/library/recipeLibrary'
import type { SavedState } from '../../utils/saved/useSaved'
import { focusById } from '../../utils/focus'
import {
  TONE_CLASSES,
  sectionTone
} from '../../components/IngredientBadge/badgeTone'
import { amountText, displayName } from '../../utils/shopping/shoppingList'
import type { ChipView } from './Chips'
import { ChipList } from './Chips'
import { ChipAllergens, SourceFields, sourceMeasure } from './ChipDetails'
import { chipChevronId, rowScope, sourceFieldId } from './chipText'
import { PlusArea, PlusButton } from './PlusArea'
import { Method, Notes, ROW_HEADING } from './RecipeRows'
import { useFocusAfterRender, usePanel } from './usePanel'

/** The notes under the method (#182): allergens of the ingredients used; F6 dropped staples. */
export const recipeNotes = (lines: readonly CopyLine[]): string[] =>
  [
    containsLine(
      itemsAllergens(
        usedLines(lines).flatMap((line) =>
          line.item === null ? [] : [line.item]
        )
      )
    )
  ].filter((note) => note !== '')

/** The heart, when signed in. */
const Heart: FC<{
  saved: SavedState | null
  recipe: LibraryRecipe
  title: string
  input: () => ReturnType<typeof saveInput>
}> = ({ saved, recipe, title, input }) =>
  saved === null ? null : (
    <div className="flex items-center gap-2">
      <SaveButton
        recipeName={title}
        saved={saved.ids.has(recipe.id)}
        onToggle={() => saved.toggle(recipe.id, input())}
      />
      <span className="text-sm">Save</span>
    </div>
  )

/** A read-only ingredient chip in Explore, in the recipe's own units. */
const OriginalChip: FC<{ line: CopyLine }> = ({ line }) => (
  <li
    data-ingredient={line.ingredientId}
    className={`flex flex-col rounded-pill border bg-gradient-to-b from-white/50 to-white/0 px-3 py-1 leading-tight shadow-raised ${
      TONE_CLASSES[sectionTone(startSection(line.item))]
    }`}
  >
    <span className="font-semibold">{displayName(line)}</span>
    <span className="text-xs">
      {amountText(line.quantity, line.measure, line.item)}
    </span>
  </li>
)

/**
 * Explore's open row (#182, answer 32): the original at 2 portions, with no picker. Save
 * stores the list's copy, customisations included, when the recipe is on the list.
 */
export const OriginalDetails: FC<{
  recipe: LibraryRecipe
  title: string
  saved: SavedState | null
  items?: readonly LibraryIngredient[]
  listCopy?: RecipeCopy | null
}> = ({ recipe, title, saved, items = catalogue, listCopy = null }) => {
  const copy = newCopy(recipe.id)
  const lines = copyLines(recipe, copy, items)
  return (
    <>
      <Heart
        saved={saved}
        recipe={recipe}
        title={title}
        input={() => saveInput(recipe, listCopy ?? copy, items)}
      />
      <div>
        <h3 className={ROW_HEADING}>Ingredients</h3>
        <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
          {lines.map((line) => (
            <OriginalChip
              key={line.ingredientId}
              line={line}
            />
          ))}
        </ul>
      </div>
      <Method recipe={recipe} />
      <Notes notes={recipeNotes(lines)} />
    </>
  )
}

/** Portions for this copy (#182, answer 30): whole numbers from 1 to 12. */
const PortionsField: FC<{
  value: number
  onChange: (portions: number) => void
}> = ({ value, onChange }) => (
  <NumberField
    value={value}
    minValue={MIN_PORTIONS}
    maxValue={MAX_PORTIONS}
    step={1}
    formatOptions={{ maximumFractionDigits: 0 }}
    onChange={(next) => {
      if (Number.isFinite(next)) onChange(next)
    }}
    className="flex items-center gap-2"
  >
    <Label className="text-sm font-semibold">Portions</Label>
    <Group>
      <Input className="h-11 w-16 rounded-control border border-border bg-surface px-2 text-center text-text focus-visible:focus-ring" />
    </Group>
  </NumberField>
)

/** The ids for a row's add button and area. */
export const rowAddId = (recipeId: string): string =>
  `${rowScope(recipeId)}-add`

/** The bullets under Customisations; nothing when the copy is the original. */
const Customisations: FC<{ bullets: readonly string[] }> = ({ bullets }) =>
  bullets.length === 0 ? null : (
    <div>
      <h3 className={ROW_HEADING}>Customisations</h3>
      <ul className="m-0 pl-5 text-sm">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  )

/** The row's chips (#182): a tap crosses off, the chevron opens the recipe's box for it. */
const CopyChips: FC<{ entry: CopyEntry; list: ChipsState; chips: Chip[] }> = ({
  entry,
  list,
  chips
}) => {
  const { panel, show } = usePanel()
  const focusAfterRender = useFocusAfterRender()
  const scope = rowScope(entry.recipe.id)
  const [adding, setAdding] = useState(false)
  const addId = rowAddId(entry.recipe.id)
  const closeAdd = useCallback(
    (refocus: boolean) => {
      setAdding(false)
      if (refocus) focusById(addId)
    },
    [addId]
  )
  const has = (id: string) => chips.some((chip) => chip.id === id)
  const view: ChipView = {
    scope,
    /* a row chip has one source, this recipe's, in its own unit */
    amountOf: (chip) =>
      chip.sources
        .map((source) =>
          amountText(source.quantity, sourceMeasure(source, chip), chip.item)
        )
        .join(', '),
    onToggle: list.toggleCrossed,
    panel,
    details: (chip) => (
      <>
        <SourceFields
          chip={chip}
          scope={scope}
          actions={{
            onAmount: (_source, value) =>
              list.setAmount(entry.recipe.id, chip.id, value),
            onRemove: () => {
              list.setAmount(entry.recipe.id, chip.id, 0)
              focusAfterRender({
                kind: 'first',
                ids: [sourceFieldId(chip.id, entry.recipe.id, scope), addId]
              })
            }
          }}
        />
        <ChipAllergens chip={chip} />
      </>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <h3 className={ROW_HEADING}>Ingredients</h3>
      <ChipList
        chips={chips}
        view={view}
      />
      <div>
        <PlusButton
          id={addId}
          areaId={`${addId}-area`}
          label={`Add an ingredient to ${entry.label}`}
          open={adding}
          onPress={() => setAdding(!adding)}
        />
        <PlusArea
          id={`${addId}-area`}
          label={`Add an ingredient to ${entry.label}`}
          mark="In this recipe"
          open={adding}
          onClose={closeAdd}
          hasChip={has}
          onPick={(item) => {
            setAdding(false)
            if (!has(item.id)) list.setAmount(entry.recipe.id, item.id, 1)
            show(item.id)
            focusAfterRender({
              kind: 'reveal',
              id: chipChevronId(item.id, scope)
            })
          }}
        />
      </div>
    </div>
  )
}

/** The Recipes row (#182): its copy with portions, editable chips, customisations and notes. */
export const CopyDetails: FC<{
  entry: CopyEntry
  title: string
  list: ChipsState
  saved: SavedState | null
  chips: Chip[]
}> = ({ entry, title, list, saved, chips }) => (
  <>
    <Heart
      saved={saved}
      recipe={entry.recipe}
      title={title}
      input={() => saveInput(entry.recipe, entry.copy, catalogue)}
    />
    <PortionsField
      value={entry.copy.portions}
      onChange={(portions) => list.setPortions(entry.recipe.id, portions)}
    />
    <CopyChips
      entry={entry}
      list={list}
      chips={chips}
    />
    <Customisations bullets={customisationBullets(entry.lines, entry.copy)} />
    <Method recipe={entry.recipe} />
    <Notes notes={recipeNotes(entry.lines)} />
  </>
)
