import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { explore, renderList, searchBox } from '../../../test/renderList'

/* #239: one primary name; search accepts regional or trade names, and says which one matched. */

expect.extend(toHaveNoViolations)
beforeEach(() => localStorage.clear())

const search = async (text: string) => {
  const user = userEvent.setup()
  await user.click(searchBox())
  await user.paste(text)
}

describe('Explore search by alias (#239)', () => {
  it('finds fresh coriander by cilantro, shows its one name and says "Also called cilantro"', async () => {
    renderList()
    await search('cilantro')
    const result = explore().getByRole('button', {
      name: 'Add fresh coriander'
    })
    expect(result).toHaveTextContent('+ Fresh coriander')
    expect(result).toHaveTextContent('Also called cilantro')
    expect(result).toHaveAccessibleDescription('Also called cilantro')
    expect(explore().queryByText('+ Cilantro')).toBeNull()
  })

  it('finds zucchini by courgette', async () => {
    renderList()
    await search('courgette')
    expect(
      explore().getByRole('button', { name: 'Add zucchini' })
    ).toBeVisible()
  })

  it('says nothing extra when the name itself matched', async () => {
    renderList()
    await search('coriander')
    const result = explore().getByRole('button', {
      name: 'Add fresh coriander'
    })
    expect(result).not.toHaveTextContent('Also called')
    expect(result).not.toHaveAttribute('aria-describedby')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderList()
    await search('cilantro')
    expect(await axe(container)).toHaveNoViolations()
    expect(screen.getByText('Also called cilantro')).toBeVisible()
  })
})
