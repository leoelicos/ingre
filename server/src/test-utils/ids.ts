import { randomBytes } from 'node:crypto'

/** A fresh public id (utils/publicId.ts), as Postgres would generate. */
export const newPublicId = (): string => randomBytes(12).toString('hex')
