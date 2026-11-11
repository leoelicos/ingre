import '@testing-library/jest-dom'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { recipeById } from '../../../test/library'
import type { LoadAudit } from '../../../utils/audit/loadAudit'
import type { AuditRow } from '../../../utils/audit/measurementAudit'
import { auditRows } from '../../../utils/audit/auditRows'
import { catalogue } from '../../../utils/library/recipeLibrary'
import { MeasurementCheck, cellText } from '../MeasurementAudit'
import { OriginalDetails } from '../RowDetails'

expect.extend(toHaveNoViolations)

const BOLOGNESE = recipeById('spaghetti-bolognese')
const TITLE = 'Spaghetti bolognese'
const ROWS = auditRows(BOLOGNESE, catalogue)

/** A loader the test settles by hand. */
const deferred = () => {
  const calls: {
    resolve: (rows: readonly AuditRow[]) => void
    reject: () => void
  }[] = []
  const load: LoadAudit = () =>
    new Promise((resolve, reject) => {
      calls.push({ resolve, reject: () => reject(new Error('offline')) })
    })
  return { load, calls }
}

const settle = async (fn: () => void) => {
  await act(async () => {
    fn()
    await Promise.resolve()
  })
}

const opener = () =>
  screen.getByRole('button', { name: `Check measurements: ${TITLE}` })
const status = () => screen.getByRole('status')
const table = () =>
  screen.getByRole('table', { name: `${TITLE}: measurements per serve` })
const header = (name: string) =>
  within(table()).getByRole('columnheader', { name })
const sortButton = (name: string) =>
  within(header(name)).getByRole('button', { name })
const rowNames = () =>
  within(table())
    .getAllByRole('rowheader')
    .map((cell) => cell.textContent)

const renderLoaded = async (rows: readonly AuditRow[] = ROWS) => {
  const user = userEvent.setup()
  const { load, calls } = deferred()
  const view = render(
    <MeasurementCheck
      recipe={BOLOGNESE}
      title={TITLE}
      load={load}
    />
  )
  await user.click(opener())
  await settle(() => calls[0]?.resolve(rows))
  return { user, calls, view }
}

describe('Measurement check: the disclosure', () => {
  it('is closed until asked, then loads once and says so', async () => {
    const user = userEvent.setup()
    const { load, calls } = deferred()
    render(
      <MeasurementCheck
        recipe={BOLOGNESE}
        title={TITLE}
        load={load}
      />
    )
    expect(opener()).toHaveAttribute('aria-expanded', 'false')
    expect(calls).toHaveLength(0)
    expect(status()).toBeEmptyDOMElement()

    await user.click(opener())
    expect(opener()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('audit-loading')).toHaveTextContent(
      'Loading measurements…'
    )
    expect(status()).toHaveTextContent('Loading measurements…')

    await settle(() => calls[0]?.resolve(ROWS))
    expect(table()).toBeVisible()
    expect(status()).toHaveTextContent('Measurements loaded: 10 ingredients.')

    /* closing keeps what was loaded, and opening again does not load again */
    await user.click(opener())
    expect(opener()).toHaveAttribute('aria-expanded', 'false')
    await user.click(opener())
    expect(calls).toHaveLength(1)
  })

  it('names the disclosure after its recipe, and controls the panel', async () => {
    render(
      <MeasurementCheck
        recipe={BOLOGNESE}
        title={TITLE}
      />
    )
    const panel = document.getElementById(
      opener().getAttribute('aria-controls') ?? ''
    )
    expect(panel).not.toBeNull()
    expect(opener()).toHaveTextContent('Check measurements')
  })

  it('loads through the real loader by default', async () => {
    const user = userEvent.setup()
    render(
      <MeasurementCheck
        recipe={BOLOGNESE}
        title={TITLE}
      />
    )
    await user.click(opener())
    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(rowNames()[0]).toBe('Spaghetti')
  })
})

describe('Measurement check: loading states', () => {
  it('shows a failure as an alert with a retry that loads again', async () => {
    const user = userEvent.setup()
    const { load, calls } = deferred()
    render(
      <MeasurementCheck
        recipe={BOLOGNESE}
        title={TITLE}
        load={load}
      />
    )
    await user.click(opener())
    await settle(() => calls[0]?.reject())
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Could not load the measurements.')
    await user.click(within(alert).getByRole('button', { name: 'Try again' }))
    expect(screen.getByTestId('audit-loading')).toHaveTextContent(
      'Loading measurements…'
    )
    await settle(() => calls[1]?.resolve(ROWS))
    expect(table()).toBeVisible()
  })

  it('says when a recipe has nothing to check', async () => {
    await renderLoaded([])
    expect(
      screen.getByText('This recipe has no ingredients to check.')
    ).toBeVisible()
    expect(screen.queryByRole('table')).toBeNull()
    expect(status()).toHaveTextContent('Measurements loaded: 0 ingredients.')
  })

  it('ignores an answer that arrives after it has gone', async () => {
    const user = userEvent.setup()
    const { load, calls } = deferred()
    const { unmount } = render(
      <MeasurementCheck
        recipe={BOLOGNESE}
        title={TITLE}
        load={load}
      />
    )
    await user.click(opener())
    unmount()
    await settle(() => calls[0]?.resolve(ROWS))
    const again = render(
      <MeasurementCheck
        recipe={BOLOGNESE}
        title={TITLE}
        load={load}
      />
    )
    await user.click(opener())
    again.unmount()
    await settle(() => calls[1]?.reject())
    expect(calls).toHaveLength(2)
  })

  it('says one ingredient in the singular', async () => {
    await renderLoaded(ROWS.slice(0, 1))
    expect(status()).toHaveTextContent('Measurements loaded: 1 ingredient.')
    expect(screen.getByText('Showing 1–1 of 1 ingredient')).toBeVisible()
  })
})

describe('Measurement check: the table', () => {
  it('is a captioned table with column and row headers, described by its note', async () => {
    await renderLoaded()
    expect(
      within(table())
        .getAllByRole('columnheader')
        .map((th) => th.textContent)
    ).toEqual([
      'Ingredient',
      'Quantity',
      'Unit',
      'Per serve (g or ml)',
      'Smallest pack',
      'Share of pack'
    ])
    expect(
      within(table())
        .getAllByRole('columnheader')
        .every((th) => th.getAttribute('scope') === 'col')
    ).toBe(true)
    expect(rowNames()).toEqual([
      'Spaghetti',
      'Beef mince',
      'Brown onion',
      'Carrot',
      'Celery'
    ])
    const onion = within(table())
      .getByRole('rowheader', { name: 'Brown onion' })
      .closest('tr')
    expect(onion).not.toBeNull()
    expect(
      within(onion as HTMLElement)
        .getAllByRole('cell')
        .map((td) => td.textContent)
    ).toEqual(['¼', 'onion', '37.5 g', '1 onion', '25%'])
    expect(table()).toHaveAccessibleDescription(
      'One serve of each ingredient, as the recipe stores it. Share of pack is how much of the smallest pack one serve uses.'
    )
  })

  it('scrolls in its own labelled, focusable box', async () => {
    await renderLoaded()
    const box = screen.getByRole('region', {
      name: `${TITLE}: measurements per serve`
    })
    expect(box).toHaveAttribute('tabindex', '0')
    expect(box).toContainElement(table())
  })

  it('sorts from the column header buttons, says the order, and starts on page 1', async () => {
    const { user } = await renderLoaded()
    expect(header('Quantity')).not.toHaveAttribute('aria-sort')

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(sortButton('Per serve (g or ml)'))
    expect(header('Per serve (g or ml)')).toHaveAttribute(
      'aria-sort',
      'ascending'
    )
    expect(status()).toHaveTextContent(
      'Sorted by Per serve (g or ml), ascending.'
    )
    expect(screen.getByText('Page 1 of 2')).toBeVisible()
    expect(rowNames()[0]).toBe('Garlic')

    await user.click(sortButton('Per serve (g or ml)'))
    expect(header('Per serve (g or ml)')).toHaveAttribute(
      'aria-sort',
      'descending'
    )
    expect(status()).toHaveTextContent(
      'Sorted by Per serve (g or ml), descending.'
    )
    expect(rowNames()[0]).toBe('Canned crushed tomatoes')

    await user.click(sortButton('Ingredient'))
    expect(header('Per serve (g or ml)')).not.toHaveAttribute('aria-sort')
    expect(header('Ingredient')).toHaveAttribute('aria-sort', 'ascending')
    expect(rowNames()[0]).toBe('Beef mince')
  })

  it('sorts by keyboard alone', async () => {
    const { user } = await renderLoaded()
    sortButton('Share of pack').focus()
    await user.keyboard('{Enter}')
    expect(header('Share of pack')).toHaveAttribute('aria-sort', 'ascending')
    await user.keyboard(' ')
    expect(header('Share of pack')).toHaveAttribute('aria-sort', 'descending')
    expect(sortButton('Share of pack')).toHaveFocus()
  })

  it('pages forward and back, and the ends stay focusable but do nothing', async () => {
    const { user } = await renderLoaded()
    const previous = screen.getByRole('button', { name: 'Previous' })
    const next = screen.getByRole('button', { name: 'Next' })
    expect(screen.getByText('Showing 1–5 of 10 ingredients')).toBeVisible()
    expect(previous).toHaveAttribute('aria-disabled', 'true')
    await user.click(previous)
    expect(screen.getByText('Page 1 of 2')).toBeVisible()

    await user.click(next)
    expect(screen.getByText('Page 2 of 2')).toBeVisible()
    expect(screen.getByText('Showing 6–10 of 10 ingredients')).toBeVisible()
    expect(status()).toHaveTextContent(
      'Page 2 of 2. Showing 6–10 of 10 ingredients.'
    )
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(next).toHaveFocus()
    await user.click(next)
    expect(screen.getByText('Page 2 of 2')).toBeVisible()
    expect(rowNames()[0]).toBe('Garlic')

    await user.click(previous)
    expect(screen.getByText('Page 1 of 2')).toBeVisible()
    expect(
      screen.getByRole('navigation', {
        name: `Pages of ${TITLE} measurements`
      })
    ).toContainElement(next)
  })

  it('changes rows per page and goes back to page 1', async () => {
    const { user } = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Rows per page' }),
      '10'
    )
    expect(rowNames()).toHaveLength(10)
    expect(screen.getByText('Page 1 of 1')).toBeVisible()
    expect(status()).toHaveTextContent(
      'Page 1 of 1. Showing 1–10 of 10 ingredients.'
    )
  })

  it('has no axe violations', async () => {
    const { view } = await renderLoaded()
    expect(await axe(view.container)).toHaveNoViolations()
  })

  it('keeps every control at least 44px tall', async () => {
    await renderLoaded()
    const controls = [
      opener(),
      ...within(table()).getAllByRole('button'),
      screen.getByRole('button', { name: 'Previous' }),
      screen.getByRole('button', { name: 'Next' }),
      screen.getByRole('combobox', { name: 'Rows per page' })
    ]
    controls.forEach((control) =>
      expect(control.className).toMatch(/min-h-\[44px\]/)
    )
  })
})

describe('Measurement check: cell text', () => {
  const unknownRow: AuditRow = {
    ingredientId: 'mystery',
    name: 'mystery',
    item: null,
    quantity: 1,
    measure: 'pinch',
    perServe: null,
    pack: null,
    share: null
  }

  it('says what is unknown and what is sold loose, in words', () => {
    expect(cellText(unknownRow, 'perServe')).toBe('Not known')
    expect(cellText(unknownRow, 'pack')).toBe('Sold loose')
    expect(cellText(unknownRow, 'share')).toBe('Not known')
    expect(cellText(unknownRow, 'name')).toBe('Mystery')
  })
})

describe('Measurement check in Explore', () => {
  it('sits under the ingredients of an open Explore row', () => {
    render(
      <OriginalDetails
        recipe={BOLOGNESE}
        title={TITLE}
        saved={null}
      />
    )
    expect(opener()).toBeInTheDocument()
  })
})
