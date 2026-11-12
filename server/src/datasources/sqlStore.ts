import { db } from '../postgres/db'
import type { SqlClient } from '../postgres/sql'

/**
 * A datasource over Postgres: the client it was given (tests), else the API's database
 * (src/postgres/db.ts), looked up when a query runs. Every query is parameterised.
 */
export abstract class SqlStore {
  constructor(private readonly client: SqlClient | null = null) {}

  protected get sql(): SqlClient {
    return this.client ?? db()
  }
}
