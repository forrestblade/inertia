import { type Locator, type Page } from '@playwright/test'

export class ListPage {
  readonly heading: Locator
  readonly rows: Locator
  readonly createButton: Locator
  readonly searchInput: Locator
  readonly pagination: Locator

  constructor (private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 })
    this.rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') })
    this.createButton = page.getByRole('link', { name: /create|new/i })
    this.searchInput = page.getByRole('searchbox')
    this.pagination = page.getByRole('navigation', { name: /pagination/i })
  }

  async goto (collection: string): Promise<void> {
    await this.page.goto(`/admin/collections/${collection}`)
  }

  async getRowCount (): Promise<number> {
    return this.rows.count()
  }

  async clickCreate (): Promise<void> {
    await this.createButton.click()
  }

  async search (query: string): Promise<void> {
    await this.searchInput.fill(query)
    await this.searchInput.press('Enter')
  }

  async goToPage (n: number): Promise<void> {
    await this.pagination.getByRole('link', { name: String(n) }).click()
  }
}
