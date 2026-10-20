/* Before `npm test`: make a clean checkout runnable (#175). Installs this
   package, the server and the client if they are missing, and Playwright's Chromium. */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const run = (command) => execSync(command, { stdio: 'inherit' })

for (const dir of ['.', '../server', '../client']) {
  if (!existsSync(`${dir}/node_modules`)) run(`npm --prefix ${dir} ci`)
}
run('npx playwright install chromium')
