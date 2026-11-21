/* Fail fast when the real-Firebase smoke is missing its env (#320). */
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'FIREBASE_SERVICE_ACCOUNT_JSON'
]

const missing = required.filter((name) => !process.env[name])
if (missing.length) {
  console.error(`The real-Firebase smoke needs these environment variables:

${missing.map((name) => `  ${name}`).join('\n')}

This command talks to the real ingre-92a75 project. It does not start the
Auth Emulator, and it is not part of npm test or PR CI. Set the real values
(never commit them) and run: npm run test:firebase-live`)
  process.exit(1)
}
