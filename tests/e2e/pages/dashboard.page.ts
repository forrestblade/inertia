import { type Locator, type Page } from '@playwright/test'

export class DashboardPage {
  readonly heading: Locator
  readonly collectionLinks: Locator
  readonly userMenu: Locator

  constructor (private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 })
    this.collectionLinks = page.getByRole('navigation').getByRole('link')
    this.userMenu = page.getByRole('button', { name: /user menu|account/i })
  }

  async goto (): Promise<void> {
    await this.page.goto('/admin')
  }

  getCollectionLink (name: string): Locator {
    return this.collectionLinks.filter({ hasText: name })
  }

  async logout (): Promise<void> {
    await this.userMenu.click()
    await this.page.getByRole('menuitem', { name: /log\s*out|sign\s*out/i }).click()
  }
}
