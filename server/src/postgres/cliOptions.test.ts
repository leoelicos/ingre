import { parseCli } from './cliOptions'

const env = {
  DATABASE_URL: 'postgres://u:p@localhost/ingre_dev',
  LEGACY_MONGODB_URI: 'mongodb://localhost/ingre'
}

describe('parseCli', () => {
  it('migrate needs DATABASE_URL and nothing else', () => {
    expect(parseCli(['migrate'], { DATABASE_URL: env.DATABASE_URL })).toEqual({
      command: 'migrate',
      databaseUrl: env.DATABASE_URL
    })
  })

  it('backfill is a dry run unless --write is given', () => {
    expect(parseCli(['backfill'], env)).toEqual({
      command: 'backfill',
      databaseUrl: env.DATABASE_URL,
      mongoUri: env.LEGACY_MONGODB_URI,
      write: false
    })
    expect(parseCli(['backfill', '--write'], env)).toMatchObject({
      write: true
    })
  })

  it('verify reads both databases and never writes', () => {
    expect(parseCli(['verify'], env)).toEqual({
      command: 'verify',
      databaseUrl: env.DATABASE_URL,
      mongoUri: env.LEGACY_MONGODB_URI
    })
  })

  it('has no default for either URL, so it cannot hit a database by accident', () => {
    expect(() => parseCli(['migrate'], {})).toThrow('DATABASE_URL')
    expect(() =>
      parseCli(['backfill'], { DATABASE_URL: env.DATABASE_URL })
    ).toThrow('LEGACY_MONGODB_URI')
  })

  it('rejects an unknown command and a stray flag', () => {
    expect(() => parseCli(['cutover'], env)).toThrow('Unknown command')
    expect(() => parseCli([], env)).toThrow('Unknown command')
    expect(() => parseCli(['verify', '--write'], env)).toThrow('--write')
  })

  it('refuses a Postgres URL that is not a postgres URL', () => {
    expect(() =>
      parseCli(['migrate'], { DATABASE_URL: 'mongodb://x/y' })
    ).toThrow('postgres')
  })
})
