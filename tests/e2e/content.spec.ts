import { test, expect } from '@playwright/test'
import { ListPage } from './pages/list.page.js'
import { DashboardPage } from './pages/dashboard.page.js'

test.describe('Content CRUD', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' })

  test('dashboard shows collection cards', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.goto()
    await expect(dashboard.heading).toHaveText('Dashboard')
    await expect(page.getByRole('link', { name: 'posts', exact: true })).toBeVisible()
  })

  test('navigate to collection list shows entries', async ({ page }) => {
    const list = new ListPage(page)
    await list.goto('posts')
    await expect(list.heading).toBeVisible()
    const count = await list.getRowCount()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('sidebar nav links to collections', async ({ page }) => {
    await page.goto('/admin')
    const sidebar = page.locator('nav, aside, [class*="sidebar"]')
    await expect(sidebar.getByRole('link', { name: 'posts', exact: true })).toBeVisible()
  })
})
