import { type Locator, type Page } from '@playwright/test'

export class EditPage {
  readonly heading: Locator
  readonly saveButton: Locator
  readonly deleteButton: Locator

  constructor (private readonly page: Page) {
    this.heading = page.locator('h1')
    this.saveButton = page.getByRole('button', { name: /save|submit|update/i })
    this.deleteButton = page.locator('.delete-trigger, [class*="delete"]')
  }

  async goto (collection: string, id: string): Promise<void> {
    await this.page.goto(`/admin/${collection}/${id}`)
  }

  async fillField (name: string, value: string): Promise<void> {
    await this.page.getByLabel(name).fill(value)
  }

  async save (): Promise<void> {
    await this.saveButton.click()
  }
}
