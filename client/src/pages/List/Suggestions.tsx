import { formatMoney, translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import { Button, ToggleButton } from 'react-aria-components'
import { Collapse } from '../../components/Collapse'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { useExplore } from '../../utils/explore/ExploreContext'
import { catalogue } from '../../utils/library/recipeLibrary'
import { placeInShop, SHOP_SECTIONS } from '../../utils/shopping/sections'
import type { Suggestion } from '../../utils/suggest/suggest'
import { ACTION_BUTTON } from './Filters'

/* The ingredient-first loop's parts (#204): pick ingredients, see what they suggest. */

const CHIP =
  'inline-flex min-h-[44px] items-center gap-1 rounded-pill bg-bg px-3 text-sm font-semibold text-text shadow-chip data-[focus-visible]:focus-ring data-[pressed]:shadow-chip-pressed data-[selected]:bg-chip-active data-[selected]:shadow-chip-pressed'

/** "Missing: sugar, raisins", or that nothing is. */
export const missingText = (missing: readonly LibraryIngredient[]): string =>
  missing.length === 0
    ? translate('suggest.nothingMissing')
    : translate('suggest.missing', {
        items: missing
          .map((item) => item.name)
          .join(translate('suggest.listSeparator'))
      })

/** A toggle that selects an ingredient to cook with; selected reads "pressed" and shows a tick. */
export const UseToggle: FC<{ item: LibraryIngredient }> = ({ item }) => {
  const t = useT()
  const { selected, toggleSelected } = useExplore()
  const on = selected.has(item.id)
  return (
    <ToggleButton
      isSelected={on}
      onChange={() => toggleSelected(item.id)}
      aria-label={t('suggest.useLabel', { name: item.name })}
      className={CHIP}
    >
      <span aria-hidden="true">{on ? '✓' : '+'}</span>
      <span>{t('suggest.use')}</span>
    </ToggleButton>
  )
}

/** An ingredient in the browse list: its own name is the label; a tick and "pressed" show it is selected. */
const IngredientChoice: FC<{ item: LibraryIngredient }> = ({ item }) => {
  const { selected, toggleSelected } = useExplore()
  const on = selected.has(item.id)
  return (
    <ToggleButton
      isSelected={on}
      onChange={() => toggleSelected(item.id)}
      className={CHIP}
    >
      <span aria-hidden="true">{on ? '✓' : '+'}</span>
      <span>{capitaliseFirst(item.name)}</span>
    </ToggleButton>
  )
}

/** The ingredients being cooked with, each with a button that takes it out. */
export const UsingBar: FC<{ items: readonly LibraryIngredient[] }> = ({
  items
}) => {
  const t = useT()
  const { toggleSelected } = useExplore()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        {t('suggest.using')}
      </h3>
      <ul
        aria-label={t('suggest.using')}
        className="m-0 flex list-none flex-wrap gap-2 p-0"
      >
        {items.map((item) => (
          <li key={item.id}>
            <Button
              aria-label={t('suggest.stopUsing', { name: item.name })}
              onPress={() => toggleSelected(item.id)}
              className={CHIP}
            >
              <span>{capitaliseFirst(item.name)}</span>
              <span aria-hidden="true">✕</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** What a suggested recipe still needs, its extra cost, and the one action that adds it. */
export const SuggestionNote: FC<{
  suggestion: Suggestion
  title: string
  picked: boolean
  onAdd: () => void
}> = ({ suggestion, title, picked, onAdd }) => {
  const t = useT()
  return (
    <div
      data-testid="suggestion-note"
      className="col-span-2 flex flex-col gap-2 px-4 pb-4 pl-14 text-sm text-text"
    >
      <p className="m-0">{missingText(suggestion.missing)}</p>
      <p className="m-0 font-semibold">
        {t('suggest.extraCost', { cost: formatMoney(suggestion.cost) })}
      </p>
      {picked ? (
        <p className="m-0 font-semibold text-success">{t('suggest.onList')}</p>
      ) : (
        <Button
          aria-label={t('suggest.addLabel', { title })}
          onPress={onAdd}
          className={`${ACTION_BUTTON} self-start`}
        >
          {t('suggest.add')}
        </Button>
      )}
    </div>
  )
}

const BROWSE_ID = 'explore-browse-ingredients'

/** Catalogue ingredients grouped by shop section, in the fixed section order. */
export const bySection = (
  items: readonly LibraryIngredient[] = catalogue
): { section: string; items: LibraryIngredient[] }[] =>
  SHOP_SECTIONS.map((section) => ({
    section,
    items: items.filter(
      (item) => placeInShop(item.category).section === section
    )
  })).filter((group) => group.items.length > 0)

/** Browse every ingredient, closed until asked for; each is a toggle that selects it. */
export const BrowseIngredients: FC = () => {
  const t = useT()
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <Button
        aria-expanded={open}
        aria-controls={BROWSE_ID}
        onPress={() => setOpen(!open)}
        className={`${ACTION_BUTTON} self-start`}
      >
        {t('suggest.browse')}
      </Button>
      <Collapse
        id={BROWSE_ID}
        open={open}
      >
        <div className="flex flex-col gap-3">
          {bySection().map(({ section, items }) => (
            <div key={section}>
              <h3 className="m-0 mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {section}
              </h3>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-1">
                {items.map((item) => (
                  <li key={item.id}>
                    <IngredientChoice item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  )
}
