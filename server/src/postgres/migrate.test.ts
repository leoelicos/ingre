import { createTestDb, createMigratedTestDb } from '../test-utils/pg'
import { listMigrations, migrate } from './migrate'
import { onlyRow, readInt, readString, requireFound } from './sql'

jest.setTimeout(60000)

const tableNames = async (db: Awaited<ReturnType<typeof createTestDb>>['db']) =>
  (
    await db.query(
      `select table_name from information_schema.tables
       where table_schema = 'public' order by table_name`
    )
  ).map((row) => readString(row, 'table_name'))

describe('listMigrations', () => {
  it('lists the sql files in order, named by file', () => {
    const migrations = listMigrations()
    expect(migrations.map(({ name }) => name)).toEqual(['0001_init.sql'])
    expect(migrations[0]?.sql).toContain('create table recipes')
  })
  it('fails loudly for a missing directory', () => {
    expect(() => listMigrations('/nonexistent-dir-217')).toThrow()
  })
})

describe('migrate', () => {
  it('creates the v1 tables on an empty database', async () => {
    const { db, close } = createTestDb()
    const applied = await migrate(db, listMigrations())
    expect(applied).toEqual(['0001_init.sql'])
    expect(await tableNames(db)).toEqual([
      'categories',
      'ingredients',
      'recipe_ingredients',
      'recipes',
      'saved_recipes',
      'schema_migrations',
      'tickets',
      'user_preferences',
      'users'
    ])
    await close()
  })

  it('is idempotent: a second run applies nothing', async () => {
    const { db, close } = await createMigratedTestDb()
    expect(await migrate(db, listMigrations())).toEqual([])
    const rows = await db.query('select count(*) as n from schema_migrations')
    expect(readInt(onlyRow(rows), 'n')).toBe(1)
    await close()
  })

  it('rolls back a failing migration and records nothing', async () => {
    const { db, close } = createTestDb()
    const bad = { name: '0002_bad.sql', sql: 'create table t (id int); boom;' }
    await expect(migrate(db, [bad])).rejects.toThrow()
    expect(await tableNames(db)).toEqual(['schema_migrations'])
    await close()
  })
})

describe('schema constraints', () => {
  it('rejects fewer than one portion', async () => {
    const { db, close } = await createMigratedTestDb()
    await expect(
      db.query(
        'insert into recipes (name, portions, picture_url) values ($1, $2, $3)',
        ['x', 0, 'u']
      )
    ).rejects.toThrow()
    await close()
  })

  it('rejects a duplicate email', async () => {
    const { db, close } = await createMigratedTestDb()
    const insert = `insert into users (first_name, last_name, email, password_hash)
                    values ('a', 'b', 'a@b.c', 'h')`
    await db.query(insert)
    await expect(db.query(insert)).rejects.toThrow()
    await close()
  })

  it('cascades a recipe delete to its lines, saves and tickets', async () => {
    const { db, close } = await createMigratedTestDb()
    await db.exec(`
      insert into ingredients (key, name) values ('k', 'Onion');
      insert into recipes (name, picture_url) values ('R', 'u');
      insert into users (first_name, last_name, email, password_hash)
        values ('a', 'b', 'a@b.c', 'h');
      insert into recipe_ingredients (recipe_id, position, ingredient_id)
        values (1, 0, 1);
      insert into saved_recipes (user_id, recipe_id, position) values (1, 1, 0);
      insert into tickets (user_id, recipe_id) values (1, 1);
      delete from recipes;
    `)
    for (const table of ['recipe_ingredients', 'saved_recipes', 'tickets']) {
      const rows = await db.query(`select count(*) as n from ${table}`)
      expect(readInt(onlyRow(rows), 'n')).toBe(0)
    }
    await close()
  })

  it('only allows open or done tickets', async () => {
    const { db, close } = await createMigratedTestDb()
    await db.exec(`
      insert into recipes (name, picture_url) values ('R', 'u');
      insert into users (first_name, last_name, email, password_hash)
        values ('a', 'b', 'a@b.c', 'h');
    `)
    await expect(
      db.query(
        'insert into tickets (user_id, recipe_id, state) values (1, 1, $1)',
        ['lost']
      )
    ).rejects.toThrow()
    await close()
  })
})

describe('sql helpers', () => {
  it('onlyRow wants exactly one row', () => {
    expect(onlyRow([{ a: 1 }])).toEqual({ a: 1 })
    expect(() => onlyRow([])).toThrow('exactly one')
    expect(() => onlyRow([{}, {}])).toThrow('exactly one')
  })

  it('requireFound throws on a miss', () => {
    expect(requireFound(new Map([['a', 1]]), 'a')).toBe(1)
    expect(() => requireFound(new Map<string, number>(), 'b')).toThrow(
      'Missing b'
    )
  })

  it('readString and readInt narrow values or throw', () => {
    expect(readString({ a: 'x' }, 'a')).toBe('x')
    expect(() => readString({ a: 1 }, 'a')).toThrow('not text')
    expect(readInt({ a: 3 }, 'a')).toBe(3)
    expect(readInt({ a: '4' }, 'a')).toBe(4)
    expect(() => readInt({ a: 'z' }, 'a')).toThrow('not an int')
  })

  it('transactions can nest by joining the outer one', async () => {
    const { db, close } = createTestDb()
    await db.exec('create table t (n int)')
    await db.transaction((tx) =>
      tx.transaction((inner) => inner.query('insert into t values (1)'))
    )
    const rows = await db.query('select count(*) as n from t')
    expect(readInt(onlyRow(rows), 'n')).toBe(1)
    await close()
  })
})
