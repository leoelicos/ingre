import { z } from 'zod'
import type { Category } from '../schemas/types'
import { SqlStore } from './sqlStore'

/** The catalogue key (as the backfill makes it): the catalogue id, else the name. */
export const ingredientKeyOf = (name: string, ingredientId: string | null) =>
  ingredientId ? ingredientId : `name:${name.trim().toLowerCase()}`

const savedRow = z.object({
  id: z.string(),
  category_id: z.string(),
  category_name: z.string()
})

export interface CreatedIngredient {
  /** the catalogue row's id, for RecipeApi.createRecipe */
  _id: string
  name: string
  quantity: number
  measure: string
  category: Category
  ingredientId: string | null
}

/**
 * Catalogue ingredients (Postgres `ingredients`), shared by every recipe line with the
 * same key. The first save names it and gives it a section; the recipe line keeps the
 * name and section this save gave it (recipe_ingredients.name / category_id).
 */
export class IngredientApi extends SqlStore {
  public createIngredient = async ({
    name,
    quantity,
    measure,
    category,
    ingredientId = null
  }: {
    name: string
    quantity: number
    measure: string
    /** the category's id (CategoryApi.findOrCreateCategory) */
    category: string
    ingredientId?: string | null
  }): Promise<CreatedIngredient> => {
    const [row] = await this.sql.query(
      `with saved as (
         insert into ingredients (key, name, category_id) values ($1, $2, $3)
         on conflict (key) do update set
           category_id = coalesce(ingredients.category_id, excluded.category_id)
         returning id
       )
       select saved.id::text as id, c.id::text as category_id,
         c.name as category_name
       from saved join categories c on c.id = $3`,
      [ingredientKeyOf(name, ingredientId), name.trim(), category]
    )
    const saved = savedRow.parse(row)
    return {
      _id: saved.id,
      name: name.trim(),
      quantity,
      measure,
      category: { _id: saved.category_id, name: saved.category_name },
      ingredientId: ingredientId || null
    }
  }
}
