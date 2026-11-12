export type CliOptions =
  | { command: 'migrate'; databaseUrl: string }
  | {
      command: 'backfill'
      databaseUrl: string
      mongoUri: string
      write: boolean
    }
  | { command: 'verify'; databaseUrl: string; mongoUri: string }

type Env = Readonly<Record<string, string | undefined>>

const required = (env: Env, name: string) => {
  const value = env[name]
  if (!value) throw new Error(`${name} is required (there is no default)`)
  return value
}

const postgresUrl = (env: Env) => {
  const url = required(env, 'DATABASE_URL')
  if (!/^postgres(ql)?:\/\//.test(url)) {
    throw new Error('DATABASE_URL must be a postgres:// URL')
  }
  return url
}

const allowFlags = (
  flags: ReadonlyArray<string>,
  allowed: ReadonlyArray<string>
) => {
  const stray = flags.find((flag) => !allowed.includes(flag))
  if (stray) throw new Error(`Unexpected flag ${stray}`)
}

const parseBackfill = (flags: ReadonlyArray<string>, env: Env): CliOptions => {
  allowFlags(flags, ['--write'])
  return {
    command: 'backfill',
    databaseUrl: postgresUrl(env),
    mongoUri: required(env, 'LEGACY_MONGODB_URI'),
    // dry run unless asked, so a mistyped command changes nothing
    write: flags.includes('--write')
  }
}

/**
 * Reads the command line for scripts/pg.ts. Neither URL has a default, and
 * `backfill` only writes to Postgres when given `--write`. Nothing here can
 * write to Mongo.
 */
export const parseCli = (args: ReadonlyArray<string>, env: Env): CliOptions => {
  const [command, ...flags] = args
  if (command === 'migrate') {
    allowFlags(flags, [])
    return { command, databaseUrl: postgresUrl(env) }
  }
  if (command === 'backfill') {
    return parseBackfill(flags, env)
  }
  if (command === 'verify') {
    allowFlags(flags, [])
    return {
      command,
      databaseUrl: postgresUrl(env),
      mongoUri: required(env, 'LEGACY_MONGODB_URI')
    }
  }
  throw new Error(`Unknown command ${command ?? '(none)'}`)
}
