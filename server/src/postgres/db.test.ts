import { createTestDb } from '../test-utils/pg'
import { assertMigrated, db, setDb } from './db'
import { listMigrations, migrate } from './migrate'
import { fromPool, type PgQueryable, type Row } from './sql'

jest.setTimeout(60000)

describe('db', () => {
  it('is set once connected, and refuses before', () => {
    setDb(null)
    expect(() => db()).toThrow('The database is not connected')
    const { db: client, close } = createTestDb()
    setDb(client)
    expect(db()).toBe(client)
    setDb(null)
    return close()
  })
})

describe('assertMigrated', () => {
  it('refuses an empty or behind schema, and passes a migrated one', async () => {
    const { db: client, close } = createTestDb()
    await expect(assertMigrated(client)).rejects.toThrow(
      'Pending migrations: 0001_init.sql, 0002_firebase_uid.sql, 0003_cutover.sql (run npm run pg -- migrate)'
    )
    const [first] = listMigrations()
    if (!first) throw new Error('no migrations')
    await migrate(client, [first])
    await expect(assertMigrated(client)).rejects.toThrow(
      'Pending migrations: 0002_firebase_uid.sql, 0003_cutover.sql'
    )
    await migrate(client, listMigrations())
    await expect(assertMigrated(client)).resolves.toBeUndefined()
    await close()
  })
})

/** A pg Pool stand-in that records what it was sent. */
const fakePool = (fail: string | null = null) => {
  const sent: string[] = []
  let released = 0
  const queryable: PgQueryable = {
    query: async (text, params = []) => {
      sent.push(params.length ? `${text} ${JSON.stringify(params)}` : text)
      if (text === fail) throw new Error('boom')
      const rows: Row[] = [{ n: 1 }]
      return { rows }
    }
  }
  return {
    sent,
    released: () => released,
    pool: {
      ...queryable,
      connect: async () => ({
        ...queryable,
        release: () => {
          released += 1
        }
      })
    }
  }
}

describe('fromPool', () => {
  it('queries and runs scripts on the pool', async () => {
    const fake = fakePool()
    const client = fromPool(fake.pool)
    expect(await client.query('select $1', [1])).toEqual([{ n: 1 }])
    expect(await client.query('select 2')).toEqual([{ n: 1 }])
    await client.exec('create table t (n int)')
    expect(fake.sent).toEqual([
      'select $1 [1]',
      'select 2',
      'create table t (n int)'
    ])
  })

  it('holds one connection per transaction, commits and releases it', async () => {
    const fake = fakePool()
    const result = await fromPool(fake.pool).transaction(async (tx) => {
      await tx.exec('insert 1')
      // a nested transaction joins the outer one
      return tx.transaction((inner) => inner.query('select 3'))
    })
    expect(result).toEqual([{ n: 1 }])
    expect(fake.sent).toEqual(['begin', 'insert 1', 'select 3', 'commit'])
    expect(fake.released()).toBe(1)
  })

  it('rolls back and releases when the work throws', async () => {
    const fake = fakePool('insert 1')
    await expect(
      fromPool(fake.pool).transaction((tx) => tx.exec('insert 1'))
    ).rejects.toThrow('boom')
    expect(fake.sent).toEqual(['begin', 'insert 1', 'rollback'])
    expect(fake.released()).toBe(1)
  })
})
