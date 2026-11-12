import {
  toUserRecord,
  USER_SELECT,
  type UserRecord
} from '../datasources/userRows'
import { db } from '../postgres/db'
import { onlyRow, readString } from '../postgres/sql'

/** The stored user with this public id; throws when there is none. */
export const storedUser = async (publicId: string): Promise<UserRecord> =>
  toUserRecord(
    onlyRow(
      await db().query(`${USER_SELECT} where u.public_id = $1`, [publicId])
    )
  )

/** Inserts a user straight into Postgres (as the backfill or an old signup left one). */
export const insertUser = async ({
  publicId = null,
  email,
  passwordHash = null,
  firebaseUid = null,
  pro = false
}: {
  publicId?: string | null
  email: string
  passwordHash?: string | null
  firebaseUid?: string | null
  pro?: boolean
}): Promise<string> => {
  const rows = await db().query(
    `insert into users
       (public_id, email, password_hash, firebase_uid, pro, first_name, last_name)
     values (coalesce($1, new_public_id()), $2, $3, $4, $5, 'Ada', 'Lovelace')
     returning public_id`,
    [publicId, email, passwordHash, firebaseUid, pro]
  )
  return readString(onlyRow(rows), 'public_id')
}
