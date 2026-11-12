import { z } from 'zod'
import type { Category } from '../schemas/types'
import { SqlStore } from './sqlStore'

const categoryRow = z.object({ id: z.coerce.string(), name: z.string() })
const toCategory = (row: unknown): Category => {
  const { id, name } = categoryRow.parse(row)
  return { _id: id, name }
}

/** Supermarket sections (Postgres `categories`); a name is one row. */
export class CategoryApi extends SqlStore {
  public findOrCreateCategory = async ({
    categoryName
  }: {
    categoryName: string
  }): Promise<Category> => {
    // the no-op update makes `returning` give the row that was already there
    const [row] = await this.sql.query(
      `insert into categories (name) values ($1)
       on conflict (name) do update set name = excluded.name
       returning id, name`,
      [categoryName.trim()]
    )
    return toCategory(row)
  }

  public getAllCategories = async (): Promise<Category[]> =>
    (await this.sql.query('select id, name from categories order by id')).map(
      toCategory
    )
}
