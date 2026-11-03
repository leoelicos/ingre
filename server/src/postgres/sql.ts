import type { PGlite, Transaction } from '@electric-sql/pglite'

export type Row = Readonly<Record<string, unknown>>

/**
 * The few things the migration code needs from a Postgres driver. `pg` and
 * PGlite (in-process, used by the tests) both sit behind it.
 */
export interface SqlClient {
  query(
    text: string,
    params?: ReadonlyArray<unknown>
  ): Promise<ReadonlyArray<Row>>
  /** Runs a script of several statements with no parameters. */
  exec(text: string): Promise<void>
  /** Commits if `work` resolves, rolls back if it throws. */
  transaction<T>(work: (tx: SqlClient) => Promise<T>): Promise<T>
}

type PgliteLike = Pick<PGlite, 'query' | 'exec'> | Transaction

const adaptQuery =
  (db: PgliteLike): SqlClient['query'] =>
  async (text, params = []) =>
    (await db.query<Row>(text, [...params])).rows

const adaptExec =
  (db: PgliteLike): SqlClient['exec'] =>
  async (text) => {
    await db.exec(text)
  }

const adaptTransaction = (tx: Transaction): SqlClient => {
  const client: SqlClient = {
    query: adaptQuery(tx),
    exec: adaptExec(tx),
    // already inside one: join it
    transaction: (work) => work(client)
  }
  return client
}

export const fromPglite = (db: PGlite): SqlClient => ({
  query: adaptQuery(db),
  exec: adaptExec(db),
  transaction: (work) => db.transaction((tx) => work(adaptTransaction(tx)))
})

export const readString = (row: Row, key: string): string => {
  const value = row[key]
  if (typeof value !== 'string') throw new Error(`Column ${key} is not text`)
  return value
}

/** Postgres returns bigint and count(*) as strings or numbers by driver. */
export const readInt = (row: Row, key: string): number => {
  const value = row[key]
  const parsed = typeof value === 'number' ? value : Number(String(value))
  if (!Number.isInteger(parsed)) throw new Error(`Column ${key} is not an int`)
  return parsed
}

/** The one row a query must return. */
export const onlyRow = (rows: ReadonlyArray<Row>): Row => {
  const [row, ...rest] = rows
  if (!row || rest.length > 0) throw new Error('Expected exactly one row')
  return row
}

/** A map lookup that must hit: a miss is a bug in the caller, not data. */
export const requireFound = <V>(
  map: ReadonlyMap<string, V>,
  key: string
): V => {
  const value = map.get(key)
  if (value === undefined) throw new Error(`Missing ${key}`)
  return value
}
