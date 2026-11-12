/*
 * npm run seed: adds the two demo accounts (pro@ingre.com and notpro@ingre.com,
 * password northshore) to a development database. Adds only; deletes nothing, and
 * skips an account that already exists. Refuses to run in production.
 *
 *   DATABASE_URL=postgres://localhost/ingre npm run seed
 */
import { connect } from '../config/connection'
import { UserApi } from '../src/datasources/user'

const DEMO_PASSWORD = 'northshore'
const DEMO_USERS = [
  { firstName: 'pro', lastName: 'pro', email: 'pro@ingre.com', pro: true },
  {
    firstName: 'notpro',
    lastName: 'notpro',
    email: 'notpro@ingre.com',
    pro: false
  }
]

const seed = async () => {
  if (
    process.env['NODE_ENV'] === 'production' ||
    process.env['APP_ENV'] === 'production'
  )
    throw new Error('Refusing to seed a production database')
  await connect()
  const users = new UserApi()
  for (const { pro, ...user } of DEMO_USERS) {
    if (await users.findOneUser({ email: user.email })) {
      console.log(`${user.email} already exists`)
      continue
    }
    const created = await users.createUser({
      ...user,
      password: DEMO_PASSWORD
    })
    if (pro) await users.makeUserPro({ _id: created._id })
    console.log(`Added ${user.email}`)
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
