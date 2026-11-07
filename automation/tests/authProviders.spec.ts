import { expect, test } from './fixtures'

test.describe('login providers (#284 #285)', () => {
  test('shows Google and biometric actions on the login page', async ({
    page
  }) => {
    await page.goto('/login')
    await expect(
      page.getByRole('heading', { name: 'Log in', level: 1 })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Continue with Google' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Use biometrics' })
    ).toBeVisible()
  })

  test('email and password login remains available beside the providers', async ({
    page
  }) => {
    await page.goto('/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
  })
})
