import { test } from './fixtures'
import { openExplore, searchBox } from './page'
test('shots239', async ({ page }, info) => {
  const w = info.project.name === 'mobile' ? 390 : 1280
  await page.goto('/')
  await openExplore(page)
  await searchBox(page).fill('cilantro')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `/workspace/report-204-241/239-alias-${w}.png` })
})
