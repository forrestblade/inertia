import { type Locator, type Page } from '@playwright/test'

export class ListPage {
  readonly heading: Locator
  readonly rows: Locator
  readonly createButton: Locator

  constructor (private readonly page: Page) {
    this.heading = page.locator('h1')
    this.rows = page.locator('table tbody tr')
    this.createButton = page.getByRole('link', { name: /create|new/i })
  }

  async goto (collection: string): Promise<void> {
    await this.page.goto(`/admin/${collection}`)
  }

  async getRowCount (): Promise<number> {
    return this.rows.count()
  }

  async clickCreate (): Promise<void> {
    await this.createButton.click()
  }
}
