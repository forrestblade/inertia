import { test, expect } from '@playwright/test'
import { EditPage } from './pages/edit.page.js'

test.use({ storageState: 'tests/e2e/.auth/user.json' })

test.describe('Error handling', () => {
  test('navigate to nonexistent page returns 404', async ({ page }) => {
    const response = await page.goto('/admin/nonexistent-page-xyz')
    expect(response?.status()).toBe(404)
  })

  test('navigate to nonexistent collection entry returns 404', async ({ page }) => {
    const response = await page.goto('/admin/collections/posts/nonexistent-id-99999')
    expect(response?.status()).toBe(404)
  })

  test('browser back and forward navigation works', async ({ page }) => {
    await page.goto('/admin')
    const edit = new EditPage(page)
    await edit.goto('posts', '1')
    await expect(page).toHaveURL(/\/posts\/1/)
    await page.goBack()
    await expect(page).toHaveURL('/admin')
    await page.goForward()
    await expect(page).toHaveURL(/\/posts\/1/)
  })
})
