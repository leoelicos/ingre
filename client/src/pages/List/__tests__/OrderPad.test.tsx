import '@testing-library/jest-dom'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  pick,
  recipes,
  renderList,
  storedCopies
} from '../../../test/renderList'
import { performOutcome } from '../OrderPad'

/*
 * #233: the order pad on a ticket (a picked recipe's row). Constraints like "portion for 3" and
 * "at most 100 g red lentils" change the ticket once, and say what they did.
 */

expect.extend(toHaveNoViolations)
beforeEach(() => localStorage.clear())

const open = async () => {
  const user = userEvent.setup()
  pick('dahl')
  const view = renderList()
  await user.click(
    recipes().getByRole('button', { name: 'Red lentil dahl details' })
  )
  return { user, view }
}
const say = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  await user.type(recipes().getByRole('textbox', { name: 'Order pad' }), text)
  await user.click(recipes().getByRole('button', { name: 'Apply' }))
}
const status = () =>
  within(screen.getByRole('region', { name: 'Recipes' })).getByRole('status')

describe('Order pad (#233)', () => {
  it('has a label, an example and a hint, and no accessibility violations', async () => {
    const { view } = await open()
    const field = recipes().getByRole('textbox', { name: 'Order pad' })
    expect(field).toHaveAttribute('placeholder', 'portion for 3')
    expect(field).toHaveAccessibleDescription(/portion for 3/)
    expect(await axe(view.container)).toHaveNoViolations()
  })

  it('"portion for 3" sets the portions', async () => {
    const { user } = await open()
    await say(user, 'portion for 3')
    expect(storedCopies()[0]?.portions).toBe(3)
    expect(status()).toHaveTextContent('Portions set to 3.')
    expect(recipes().getByRole('textbox', { name: 'Order pad' })).toHaveValue(
      ''
    )
  })

  it('"at most 100 g red lentils" cuts the amount, and Enter submits too', async () => {
    const { user } = await open()
    await user.type(
      recipes().getByRole('textbox', { name: 'Order pad' }),
      'at most 100 g red lentils{Enter}'
    )
    expect(storedCopies()[0]?.amounts['red-lentils']).toBe(50)
    expect(status()).toHaveTextContent('Red lentils set to 100 g.')
  })

  it('says when the ingredient is already within the limit and changes nothing', async () => {
    const { user } = await open()
    await say(user, 'at most 1 kg red lentils')
    expect(storedCopies()[0]?.amounts).toEqual({})
    expect(status()).toHaveTextContent('Red lentils is already within that.')
    expect(recipes().getByRole('textbox', { name: 'Order pad' })).toHaveValue(
      'at most 1 kg red lentils'
    )
  })

  it.each([
    ['at most 1 kg carrots', 'No carrots in this recipe.'],
    ['at most 2 red lentils', 'Red lentils can’t be compared in that unit.'],
    ['portion for 13', 'Portions go from 1 to 12.'],
    [
      'lots of lentils',
      'Not understood. Try “portion for 3” or “at most 1 kg carrots”.'
    ]
  ])('says what went wrong for %s', async (text, message) => {
    const { user } = await open()
    await say(user, text)
    expect(status()).toHaveTextContent(message)
    expect(storedCopies()[0]?.portions).toBe(2)
  })
})

describe('performOutcome', () => {
  it('changes nothing for outcomes that change nothing', () => {
    const calls: string[] = []
    const actions = {
      onPortions: () => calls.push('portions'),
      onAmount: () => calls.push('amount')
    }
    performOutcome({ kind: 'within', name: 'x' }, actions)
    performOutcome({ kind: 'range' }, actions)
    performOutcome({ kind: 'missing', ingredient: 'x' }, actions)
    performOutcome({ kind: 'unit', name: 'x' }, actions)
    expect(calls).toEqual([])
  })
})
