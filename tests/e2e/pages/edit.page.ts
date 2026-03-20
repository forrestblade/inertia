import { type Locator, type Page } from '@playwright/test'

export class EditPage {
  readonly heading: Locator
  readonly saveButton: Locator
  readonly deleteButton: Locator
  readonly fields: Locator

  constructor (private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 })
    this.saveButton = page.getByRole('button', { name: /save/i })
    this.deleteButton = page.getByRole('button', { name: /delete/i })
    this.fields = page.getByRole('main').locator('[data-field]')
  }

  async goto (collection: string, id: string): Promise<void> {
    await this.page.goto(`/admin/collections/${collection}/${id}`)
  }

  async fillField (name: string, value: string): Promise<void> {
    await this.page.getByLabel(name).fill(value)
  }

  async save (): Promise<void> {
    await this.saveButton.click()
  }

  async delete (): Promise<void> {
    await this.deleteButton.click()
    await this.page.getByRole('button', { name: /confirm/i }).click()
  }
}
