import { translate, useT } from '../../i18n'
import type { FC, ReactNode } from 'react'
import { useId, useState } from 'react'
import { Button, ToggleButton } from 'react-aria-components'
import { Chevron, Collapse, MOTION } from '../../components/Collapse'
import { splitTitle } from '../../components/recipeTitle'
import type { LibraryRecipe } from '../../types/library'
import type { CopyLine } from '../../utils/balance/copies'
import { IngredientNames } from './IngredientNames'

/** What every row shares: picks, open rows, and what an open row shows. */
export interface RowControls {
  readonly pickedIds: ReadonlySet<string>
  readonly onTogglePicked: (recipe: LibraryRecipe) => void
  readonly openIds: ReadonlySet<string>
  readonly onToggleOpen: (id: string) => void
  /** Explore's rows open with a "See recipe" button; list rows with a chevron (#181) */
  readonly seeRecipe: boolean
  /** Recipes' rows are recessed into the raised section; Explore's stay raised until picked */
  readonly recessed: boolean
}

/** A row: its recipe and what it shows open, the original in Explore or the copy in Recipes (#182). */
export interface Row {
  readonly recipe: LibraryRecipe
  /** the ingredients it uses, named under the title while the row is closed (#191) */
  readonly lines: readonly CopyLine[]
  readonly details: (title: string) => ReactNode
}

export const ROW_HEADING = 'm-0 text-sm font-semibold uppercase tracking-wide'

/** A picked row has a primary border (at least 3:1 on the page) as well as its check mark. */
export const rowBorder = (picked: boolean): string =>
  picked ? 'border-primary' : 'border-transparent'

/**
 * A row's depth. In Recipes it is recessed into the raised section, with no fill and a
 * tighter shadow than the section's. In Explore it is raised, and pressed in once picked.
 */
export const rowDepth = (picked: boolean, recessed: boolean): string => {
  if (recessed) return 'bg-transparent shadow-recessed'
  return picked ? 'bg-bg shadow-pressed' : 'bg-bg shadow-raised'
}

const rowClass = (picked: boolean, recessed: boolean): string =>
  `grid grid-cols-[1fr_auto] rounded-card border-2 transition-shadow ${MOTION} ${rowBorder(
    picked
  )} ${rowDepth(picked, recessed)}`

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
 * Closed, a row shows its name and every ingredient as a read-only chip (#191); open, the
 * editable chips replace them. Never a key-ingredient preview or badges.
 */
export const RecipeRow: FC<{
  row: Row
  controls: RowControls
}> = ({ row, controls }) => {
  const t = useT()
  const { recipe } = row
  const id = useId()
  const { title } = splitTitle(recipe.name)
  const picked = controls.pickedIds.has(recipe.id)
  const open = controls.openIds.has(recipe.id)
  const detailsId = `${id}-details`
  const shown = useShownOnce(open)
  return (
    <li
      data-recipe={recipe.id}
      className={rowClass(picked, controls.recessed)}
    >
      <ToggleButton
        isSelected={picked}
        onChange={() => controls.onTogglePicked(recipe)}
        aria-labelledby={`${id}-title`}
        className="flex min-h-[44px] items-start gap-3 rounded-l-card p-4 text-left data-[focus-visible]:focus-ring"
      >
        <CheckMark picked={picked} />
        <span
          id={`${id}-title`}
          className="min-w-0 text-lg font-semibold leading-snug text-text"
        >
          {title}
        </span>
      </ToggleButton>
      <Button
        aria-label={
          controls.seeRecipe
            ? t('row.seeRecipeLabel', { title })
            : t('row.details', { title })
        }
        aria-expanded={open}
        aria-controls={detailsId}
        onPress={() => controls.onToggleOpen(recipe.id)}
        className="flex min-h-[44px] min-w-[44px] items-start justify-center gap-1 whitespace-nowrap rounded-r-card p-4 text-sm font-semibold text-text data-[focus-visible]:focus-ring"
      >
        {controls.seeRecipe && <span>{t('row.seeRecipe')}</span>}
        <Chevron open={open} />
      </Button>
      {!open && (
        <IngredientNames
          lines={row.lines}
          title={title}
        />
      )}
      <Collapse
        id={detailsId}
        open={open}
        className="col-span-2"
      >
        {shown && (
          <div className="flex flex-col gap-4 border-t border-border px-4 pb-4 pt-3 text-text">
            {row.details(title)}
          </div>
        )}
      </Collapse>
    </li>
  )
}

/** The recipe rows: a single-column grid of rows, not cards. */
export const RecipeRows: FC<{
  rows: readonly Row[]
  controls: RowControls
}> = ({ rows, controls }) => (
  <ul className="m-0 grid list-none grid-cols-1 gap-4 p-1">
    {rows.map((row) => (
      <RecipeRow
        key={row.recipe.id}
        row={row}
        controls={controls}
      />
    ))}
  </ul>
)

/** The method steps. */
export const Method: FC<{ recipe: LibraryRecipe }> = ({ recipe }) => (
  <div>
    <h3 className={ROW_HEADING}>{translate('row.method')}</h3>
    <ol className="m-0 pl-5">
      {recipe.method.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  </div>
)

/** The notes under the method; nothing when there are none. */
export const Notes: FC<{ notes: readonly string[] }> = ({ notes }) =>
  notes.length === 0 ? null : (
    <div>
      <h3 className={ROW_HEADING}>{translate('row.notes')}</h3>
      {notes.map((note) => (
        <p
          key={note}
          className="m-0 text-sm"
        >
          {note}
        </p>
      ))}
    </div>
  )
