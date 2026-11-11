import { UnknownRecipeError, loadAudit } from '../loadAudit'

describe('loadAudit', () => {
  it('builds the rows for a recipe in the catalogue', async () => {
    const rows = await loadAudit('spaghetti-bolognese')
    expect(rows[0]).toMatchObject({ ingredientId: 'spaghetti' })
  })

  it('fails for a recipe the catalogue does not have', async () => {
    await expect(loadAudit('nope')).rejects.toBeInstanceOf(UnknownRecipeError)
    await expect(loadAudit('nope')).rejects.toThrow('No recipe with id "nope"')
  })
})
