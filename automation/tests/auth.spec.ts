import {
  accountMenu,
  expect,
  expectLoggedIn,
  newAccount,
  signUp,
  test
} from './fixtures'

test.describe('account', () => {
  test('sign up, log out and log in again from the account menu', async ({
    page
  }) => {
    const account = newAccount()
    await signUp(page, account)

    await accountMenu(page, 'Log out')
    await page.getByRole('button', { name: 'Account' }).click()
    await expect(page.getByRole('menuitem', { name: 'Log in' })).toBeVisible()
    await page.getByRole('menuitem', { name: 'Log in' }).click()

    await expect(
      page.getByRole('heading', { name: 'Log in', level: 1 })
    ).toBeVisible()
    await page.getByLabel('Email').fill(account.email)
    await page.locator('#password').fill(account.password)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL('/')
    await expectLoggedIn(page)

    // the session survives a reload (token in this device's storage)
    await page.reload()
    await expectLoggedIn(page)
  })

  test('a wrong password is refused with a message', async ({ page }) => {
    const account = newAccount()
    await signUp(page, account)
    await accountMenu(page, 'Log out')
    await page.goto('/login')
    await page.getByLabel('Email').fill(account.email)
    await page.locator('#password').fill('not the password')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(page).toHaveURL('/login')
  })
})
