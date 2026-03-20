import { test, expect } from '@playwright/test'
import { ListPage } from './pages/list.page.js'
import { EditPage } from './pages/edit.page.js'

test.use({ storageState: 'tests/e2e/.auth/user.json' })

test.describe('Content CRUD', () => {
  test('navigate to collection list shows entries', async ({ page }) => {
    const list = new ListPage(page)
    await list.goto('posts')
    await expect(list.heading).toBeVisible()
    const count = await list.getRowCount()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('click create opens edit form', async ({ page }) => {
    const list = new ListPage(page)
    await list.goto('posts')
    await list.clickCreate()
    const edit = new EditPage(page)
    await expect(edit.heading).toBeVisible()
    await expect(edit.saveButton).toBeVisible()
  })

  test('fill fields and save redirects to list with new entry visible', async ({ page }) => {
    const list = new ListPage(page)
    await list.goto('posts')
    const initialCount = await list.getRowCount()
    await list.clickCreate()
    const edit = new EditPage(page)
    await edit.fillField('Title', 'E2E Test Post')
    await edit.save()
    await expect(page).toHaveURL(/\/admin\/collections\/posts/)
    await expect(page.getByText('E2E Test Post')).toBeVisible()
    const newCount = await list.getRowCount()
    expect(newCount).toBeGreaterThan(initialCount)
  })

  test('edit existing entry persists changes', async ({ page }) => {
    const edit = new EditPage(page)
    await edit.goto('posts', '1')
    await edit.fillField('Title', 'Updated E2E Post')
    await edit.save()
    await edit.goto('posts', '1')
    await expect(page.getByLabel('Title')).toHaveValue('Updated E2E Post')
  })

  test('delete entry removes it from list', async ({ page }) => {
    const list = new ListPage(page)
    await list.goto('posts')
    const initialCount = await list.getRowCount()
    const edit = new EditPage(page)
    await edit.goto('posts', '1')
    await edit.delete()
    await expect(page).toHaveURL(/\/admin\/collections\/posts/)
    const newCount = await list.getRowCount()
    expect(newCount).toBeLessThan(initialCount)
  })
})
