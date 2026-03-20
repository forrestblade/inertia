import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-tabs.js'

const meta: Meta = {
  title: 'Components/Tabs',
  component: 'val-tabs',
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => html`
    <val-tabs>
      <button slot="tab" data-panel="overview">Overview</button>
      <button slot="tab" data-panel="details">Details</button>
      <button slot="tab" data-panel="settings">Settings</button>

      <div slot="panel" data-name="overview">
        <p style="font-family: var(--val-font-sans); color: var(--val-color-text);">
          This is the overview panel content.
        </p>
      </div>
      <div slot="panel" data-name="details">
        <p style="font-family: var(--val-font-sans); color: var(--val-color-text);">
          This is the details panel content.
        </p>
      </div>
      <div slot="panel" data-name="settings">
        <p style="font-family: var(--val-font-sans); color: var(--val-color-text);">
          This is the settings panel content.
        </p>
      </div>
    </val-tabs>
  `
}

export const ManyTabs: Story = {
  name: 'Many Tabs',
  render: () => html`
    <val-tabs>
      <button slot="tab" data-panel="general">General</button>
      <button slot="tab" data-panel="appearance">Appearance</button>
      <button slot="tab" data-panel="notifications">Notifications</button>
      <button slot="tab" data-panel="security">Security</button>
      <button slot="tab" data-panel="billing">Billing</button>

      <div slot="panel" data-name="general" style="font-family: var(--val-font-sans); color: var(--val-color-text);">
        General settings panel
      </div>
      <div slot="panel" data-name="appearance" style="font-family: var(--val-font-sans); color: var(--val-color-text);">
        Appearance settings panel
      </div>
      <div slot="panel" data-name="notifications" style="font-family: var(--val-font-sans); color: var(--val-color-text);">
        Notification preferences panel
      </div>
      <div slot="panel" data-name="security" style="font-family: var(--val-font-sans); color: var(--val-color-text);">
        Security settings panel
      </div>
      <div slot="panel" data-name="billing" style="font-family: var(--val-font-sans); color: var(--val-color-text);">
        Billing information panel
      </div>
    </val-tabs>
  `
}

export const WithRichContent: Story = {
  name: 'With Rich Content',
  render: () => html`
    <val-tabs>
      <button slot="tab" data-panel="users">Users</button>
      <button slot="tab" data-panel="analytics">Analytics</button>

      <div slot="panel" data-name="users" style="font-family: var(--val-font-sans); color: var(--val-color-text); padding: 8px 0;">
        <h3 style="margin: 0 0 8px; font-size: var(--val-text-lg);">User Management</h3>
        <p style="margin: 0; color: var(--val-color-text-muted); font-size: var(--val-text-sm);">
          Manage your users and their permissions here.
        </p>
      </div>
      <div slot="panel" data-name="analytics" style="font-family: var(--val-font-sans); color: var(--val-color-text); padding: 8px 0;">
        <h3 style="margin: 0 0 8px; font-size: var(--val-text-lg);">Analytics Dashboard</h3>
        <p style="margin: 0; color: var(--val-color-text-muted); font-size: var(--val-text-sm);">
          View your analytics and performance metrics.
        </p>
      </div>
    </val-tabs>
  `
}
