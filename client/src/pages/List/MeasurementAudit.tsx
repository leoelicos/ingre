import {
  formatPercent,
  formatQuantityNumber,
  translate,
  useT
} from '../../i18n'
import type { FC } from 'react'
import { useId, useState } from 'react'
import { Chevron, Collapse } from '../../components/Collapse'
import { Button } from '../../lib/aria'
import type { Amount, LibraryRecipe } from '../../types/library'
import type { LoadAudit } from '../../utils/audit/loadAudit'
import { loadAudit } from '../../utils/audit/loadAudit'
import type {
  AuditColumn,
  AuditRow,
  AuditSort,
  Page
} from '../../utils/audit/measurementAudit'
import {
  AUDIT_COLUMNS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  nextSort,
  pageOf,
  sortRows
} from '../../utils/audit/measurementAudit'
import { useAudit } from '../../utils/audit/useAudit'
import { displayName, measureWord } from '../../utils/shopping/shoppingList'
import { formatAmount } from '../../utils/shopping/units'
import { ROW_HEADING, useShownOnce } from './RecipeRows'

/*
 * The measurement audit table: a recipe's ingredient lines per serve, sortable and paged.
 * Real table markup (caption, column and row headers) so a screen reader can move by cell and
 * hear each header; the sort lives on buttons inside the column headers and is announced.
 */

/** Columns whose values are numbers: right-aligned so digits line up. */
const NUMERIC: ReadonlySet<AuditColumn> = new Set([
  'quantity',
  'perServe',
  'pack',
  'share'
])

export const columnName = (column: AuditColumn): string => {
  switch (column) {
    case 'name':
      return translate('audit.column.name')
    case 'quantity':
      return translate('audit.column.quantity')
    case 'unit':
      return translate('audit.column.unit')
    case 'perServe':
      return translate('audit.column.perServe')
    case 'pack':
      return translate('audit.column.pack')
    case 'share':
      return translate('audit.column.share')
  }
}

const directionWord = (sort: AuditSort): string =>
  translate(
    sort.direction === 'ascending' ? 'audit.ascending' : 'audit.descending'
  )

export const sortAnnouncement = (sort: AuditSort): string =>
  translate('audit.sorted', {
    column: columnName(sort.column),
    direction: directionWord(sort)
  })

export const showingText = (page: Page<unknown>): string =>
  translate('audit.showing', {
    first: page.first,
    last: page.last,
    count: page.total
  })

export const pageAnnouncement = (page: Page<unknown>): string =>
  translate('audit.pageAnnounce', {
    page: page.page,
    pages: page.pageCount,
    showing: showingText(page)
  })

const unknown = (): string => translate('audit.unknown')

const amountOrUnknown = (amount: Amount | null): string =>
  amount === null ? unknown() : formatAmount(amount)

/** What each cell reads, by column. */
export const cellText = (row: AuditRow, column: AuditColumn): string => {
  switch (column) {
    case 'name':
      return displayName(row)
    case 'quantity':
      return formatQuantityNumber(row.quantity, row.measure)
    case 'unit':
      return measureWord(row.quantity, row.measure, row.item)
    case 'perServe':
      return amountOrUnknown(row.perServe)
    case 'pack':
      return row.pack === null
        ? translate('audit.loose')
        : formatAmount(row.pack, row.item)
    case 'share':
      return row.share === null ? unknown() : formatPercent(row.share)
  }
}

/** The sort arrow: up, down, or both when unsorted. Decorative: aria-sort says the state. */
const SortIcon: FC<{ direction: AuditSort['direction'] | null }> = ({
  direction
}) => (
  <svg
    aria-hidden="true"
    data-sort-icon={direction ?? 'none'}
    viewBox="0 0 12 16"
    width="12"
    height="16"
    fill="currentColor"
    className="shrink-0"
  >
    {direction !== 'descending' && <path d="M6 1l5 6H1z" />}
    {direction !== 'ascending' && <path d="M6 15l5-6H1z" />}
  </svg>
)

const HEADER_BUTTON =
  'inline-flex min-h-[44px] items-center gap-1 rounded-control px-1 font-semibold text-text data-[focus-visible]:focus-ring'
const PAGER_BUTTON =
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-pill border border-border bg-surface px-4 font-semibold text-text data-[focus-visible]:focus-ring aria-disabled:cursor-not-allowed aria-disabled:opacity-60'
/*
 * The table scrolls sideways inside its own box on a narrow screen, never the page. Width 0 with
 * a full min-width means the table's width never widens the row around it.
 */
const SCROLL =
  '@container w-0 min-w-full overflow-x-auto rounded-control focus-visible:focus-ring'
/** The caption stays in view, and wraps to the box's width, while the columns scroll under it. */
const CAPTION = 'sticky left-0 max-w-[100cqw] pb-1 text-left font-semibold'
/** The first column stays put while the rest scroll sideways on a narrow screen. */
const STICKY = 'sticky left-0 z-[1] bg-bg'

const align = (column: AuditColumn): string =>
  NUMERIC.has(column) ? 'text-right' : 'text-left'

const ColumnHeader: FC<{
  column: AuditColumn
  sort: AuditSort | null
  onSort: (column: AuditColumn) => void
}> = ({ column, sort, onSort }) => {
  const direction = sort?.column === column ? sort.direction : null
  return (
    <th
      scope="col"
      {...(direction === null ? {} : { 'aria-sort': direction })}
      className={`border-b-2 border-border px-2 py-1 align-bottom ${align(
        column
      )} ${column === 'name' ? STICKY : ''}`}
    >
      <Button
        onPress={() => onSort(column)}
        className={`${HEADER_BUTTON} ${
          NUMERIC.has(column) ? 'flex-row-reverse text-right' : 'text-left'
        }`}
      >
        <span>{columnName(column)}</span>
        <SortIcon direction={direction} />
      </Button>
    </th>
  )
}

/** A pager button that stays focusable at either end (aria-disabled), so focus is never lost. */
const PagerButton: FC<{
  label: string
  disabled: boolean
  onPress: () => void
}> = ({ label, disabled, onPress }) => (
  <Button
    onPress={() => {
      if (!disabled) onPress()
    }}
    {...(disabled ? { 'aria-disabled': true } : {})}
    className={PAGER_BUTTON}
  >
    {label}
  </Button>
)

const Pager: FC<{
  page: Page<AuditRow>
  size: number
  title: string
  onPage: (page: number) => void
  onSize: (size: number) => void
}> = ({ page, size, title, onPage, onSize }) => {
  const t = useT()
  const sizeId = useId()
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <p className="m-0">{showingText(page)}</p>
      <div className="flex items-center gap-2">
        <label
          htmlFor={sizeId}
          className="font-semibold"
        >
          {t('audit.pageSize')}
        </label>
        <select
          id={sizeId}
          value={size}
          onChange={(event) => onSize(Number(event.target.value))}
          className="min-h-[44px] rounded-control border border-border bg-surface px-2 text-text focus-visible:focus-ring"
        >
          {PAGE_SIZES.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>
      <nav
        aria-label={t('audit.pages', { title })}
        className="flex items-center gap-2"
      >
        <PagerButton
          label={t('audit.previous')}
          disabled={page.page <= 1}
          onPress={() => onPage(page.page - 1)}
        />
        <p className="m-0">
          {t('audit.pageOf', { page: page.page, count: page.pageCount })}
        </p>
        <PagerButton
          label={t('audit.next')}
          disabled={page.page >= page.pageCount}
          onPress={() => onPage(page.page + 1)}
        />
      </nav>
    </div>
  )
}

/** The loaded table: sort, page and page size are the reader's, and each change is announced. */
export const AuditTable: FC<{
  rows: readonly AuditRow[]
  title: string
  announce: (message: string) => void
}> = ({ rows, title, announce }) => {
  const t = useT()
  const id = useId()
  const [sort, setSort] = useState<AuditSort | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE)
  const sorted = sort === null ? rows : sortRows(rows, sort)
  const page = pageOf(sorted, pageNumber, size)
  const captionId = `${id}-caption`
  const noteId = `${id}-note`
  const onSort = (column: AuditColumn) => {
    const next = nextSort(sort, column)
    setSort(next)
    setPageNumber(1)
    announce(sortAnnouncement(next))
  }
  const onPage = (to: number) => {
    setPageNumber(to)
    announce(pageAnnouncement(pageOf(sorted, to, size)))
  }
  const onSize = (to: number) => {
    setSize(to)
    setPageNumber(1)
    announce(pageAnnouncement(pageOf(sorted, 1, to)))
  }
  return (
    <div>
      <div
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        className={SCROLL}
      >
        <table
          aria-describedby={noteId}
          className="w-full border-collapse text-sm text-text"
        >
          <caption
            id={captionId}
            className={CAPTION}
          >
            {t('audit.caption', { title })}
          </caption>
          <thead>
            <tr>
              {AUDIT_COLUMNS.map((column) => (
                <ColumnHeader
                  key={column}
                  column={column}
                  sort={sort}
                  onSort={onSort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row) => (
              <tr
                key={row.ingredientId}
                data-ingredient={row.ingredientId}
                className="border-b border-border"
              >
                <th
                  scope="row"
                  className={`px-2 py-2 text-left font-semibold ${STICKY}`}
                >
                  {cellText(row, 'name')}
                </th>
                {AUDIT_COLUMNS.slice(1).map((column) => (
                  <td
                    key={column}
                    className={`whitespace-nowrap px-2 py-2 tabular-nums ${align(
                      column
                    )}`}
                  >
                    {cellText(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p
        id={noteId}
        className="m-0 mt-2 text-sm text-text-secondary"
      >
        {t('audit.note')}
      </p>
      <Pager
        page={page}
        size={size}
        title={title}
        onPage={onPage}
        onSize={onSize}
      />
    </div>
  )
}

/** Loading, failed (with a retry), empty, or the table. */
export const AuditBody: FC<{
  recipeId: string
  title: string
  load: LoadAudit
  announce: (message: string) => void
}> = ({ recipeId, title, load, announce }) => {
  const t = useT()
  const { state, retry } = useAudit(recipeId, load, announce)
  /* the live region already says it, so the visible copy is not read twice */
  if (state.status === 'loading')
    return (
      <p
        aria-hidden="true"
        data-testid="audit-loading"
        className="m-0 text-sm"
      >
        {t('audit.loading')}
      </p>
    )
  if (state.status === 'error')
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-2 text-sm"
      >
        <p className="m-0">{t('audit.failed')}</p>
        <Button
          onPress={retry}
          className={PAGER_BUTTON}
        >
          {t('audit.retry')}
        </Button>
      </div>
    )
  if (state.rows.length === 0)
    return <p className="m-0 text-sm">{t('audit.empty')}</p>
  return (
    <AuditTable
      rows={state.rows}
      title={title}
      announce={announce}
    />
  )
}

/**
 * "Check measurements" under a recipe's ingredients in Explore: a disclosure that loads the
 * audit the first time it opens. The live region sits outside the disclosure so it exists
 * before anything is announced into it.
 */
export const MeasurementCheck: FC<{
  recipe: LibraryRecipe
  title: string
  load?: LoadAudit
}> = ({ recipe, title, load = loadAudit }) => {
  const t = useT()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const shown = useShownOnce(open)
  const panelId = `${id}-audit`
  return (
    <div>
      <Button
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('audit.openLabel', { title })}
        onPress={() => setOpen(!open)}
        className={`${ROW_HEADING} inline-flex min-h-[44px] items-center gap-2 rounded-control text-text data-[focus-visible]:focus-ring`}
      >
        {t('audit.open')}
        <Chevron open={open} />
      </Button>
      <p
        role="status"
        className="sr-only"
      >
        {message}
      </p>
      <Collapse
        id={panelId}
        open={open}
      >
        {shown && (
          <AuditBody
            recipeId={recipe.id}
            title={title}
            load={load}
            announce={setMessage}
          />
        )}
      </Collapse>
    </div>
  )
}
