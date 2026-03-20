import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/login.page.js'
import { DashboardPage } from './pages/dashboard.page.js'

test.describe('Auth flow', () => {
  test('login with valid credentials redirects to /admin', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login('admin@test.local', 'admin123')
    await expect(page).toHaveURL('/admin')
  })

  test('login with wrong password shows error', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login('admin@test.local', 'wrongpassword')
    const error = await login.getError()
    expect(error).toBeTruthy()
  })

  test('login with empty fields shows validation', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.loginButton.click()
    const error = await login.getError()
    expect(error).toBeTruthy()
  })

  test('accessing /admin without auth redirects to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})

test.describe('Auth flow (authenticated)', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' })

  test('logout redirects to login page', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.goto()
    await dashboard.logout()
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
