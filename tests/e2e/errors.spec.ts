import { test, expect } from '@playwright/test'

test.describe('Error handling', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' })

  test('nonexistent API endpoint returns 404 JSON', async ({ page }) => {
    const response = await page.goto('/api/nonexistent')
    expect(response?.status()).toBe(404)
    const body = await page.textContent('body')
    expect(body).toContain('Not found')
  })

  test('browser back navigation works', async ({ page }) => {
    await page.goto('/admin')
    const sidebar = page.locator('nav, aside, [class*="sidebar"]')
    await sidebar.getByRole('link', { name: 'posts', exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/posts/)
    await page.goBack()
    await expect(page).toHaveURL(/\/admin$/)
  })
})
