import { z } from 'zod'
import type { CustomisationDoc } from './types'

/** One stored change (#182), read back from Postgres jsonb or a Mongo document. */
export const customisationSchema = z
  .object({
    kind: z.enum([
      'AddedIngredient',
      'RemovedIngredient',
      'ChangedIngredient',
      'PortionsChange'
    ]),
    ingredientId: z.string().optional(),
    from: z.number().optional(),
    to: z.number().optional()
  })
  .transform(
    ({ kind, ingredientId, from, to }): CustomisationDoc => ({
      kind,
      ...(ingredientId === undefined ? {} : { ingredientId }),
      ...(from === undefined ? {} : { from }),
      ...(to === undefined ? {} : { to })
    })
  )
