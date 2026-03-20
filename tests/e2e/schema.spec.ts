import { test, expect } from '@playwright/test'
import { DashboardPage } from './pages/dashboard.page.js'
import { ListPage } from './pages/list.page.js'
import { EditPage } from './pages/edit.page.js'

test.use({ storageState: 'tests/e2e/.auth/user.json' })

test.describe('Schema builder', () => {
  test('admin dashboard shows collection links', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.goto()
    await expect(dashboard.heading).toBeVisible()
    await expect(dashboard.collectionLinks.first()).toBeVisible()
  })

  test('collection list shows correct heading', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.goto()
    const link = dashboard.collectionLinks.first()
    const name = await link.textContent()
    await link.click()
    const list = new ListPage(page)
    await expect(list.heading).toBeVisible()
    if (name !== null) {
      await expect(list.heading).toContainText(name.trim(), { ignoreCase: true })
    }
  })

  test('create button navigates to edit page', async ({ page }) => {
    const list = new ListPage(page)
    await list.goto('posts')
    await list.clickCreate()
    const edit = new EditPage(page)
    await expect(edit.heading).toBeVisible()
    await expect(page.url()).toContain('/admin/collections/posts')
  })
})
