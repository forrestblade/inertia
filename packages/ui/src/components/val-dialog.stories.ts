import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-dialog.js'
import './val-button.js'

const meta: Meta = {
  title: 'Components/Dialog',
  component: 'val-dialog',
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open'
    }
  },
  args: {
    open: false
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => html`
    <val-dialog ?open=${args['open']} id="demo-dialog">
      <div style="font-family: var(--val-font-sans);">
        <h2 style="margin: 0 0 16px; font-size: var(--val-text-xl); font-weight: var(--val-weight-semibold); color: var(--val-color-text);">
          Dialog Title
        </h2>
        <p style="margin: 0 0 24px; color: var(--val-color-text-muted); font-size: var(--val-text-sm);">
          This is the dialog content. You can put any content here.
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <val-button variant="secondary" onclick="document.getElementById('demo-dialog').close()">
            Cancel
          </val-button>
          <val-button onclick="document.getElementById('demo-dialog').close()">
            Confirm
          </val-button>
        </div>
      </div>
    </val-dialog>
    <val-button onclick="document.getElementById('demo-dialog').show()">Open Dialog</val-button>
  `
}

export const Open: Story = {
  name: 'Open State',
  render: () => html`
    <val-dialog open>
      <div style="font-family: var(--val-font-sans);">
        <h2 style="margin: 0 0 16px; font-size: var(--val-text-xl); font-weight: var(--val-weight-semibold); color: var(--val-color-text);">
          Confirm Action
        </h2>
        <p style="margin: 0 0 24px; color: var(--val-color-text-muted); font-size: var(--val-text-sm);">
          Are you sure you want to perform this action? This cannot be undone.
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <val-button variant="secondary">Cancel</val-button>
          <val-button>Confirm</val-button>
        </div>
      </div>
    </val-dialog>
  `
}

export const WithLongContent: Story = {
  name: 'Long Content',
  render: () => html`
    <val-dialog open>
      <div style="font-family: var(--val-font-sans);">
        <h2 style="margin: 0 0 16px; font-size: var(--val-text-xl); font-weight: var(--val-weight-semibold); color: var(--val-color-text);">
          Terms of Service
        </h2>
        ${Array.from({ length: 8 }, (_, i) => html`
          <p style="margin: 0 0 16px; color: var(--val-color-text-muted); font-size: var(--val-text-sm);">
            Section ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        `)}
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <val-button variant="secondary">Decline</val-button>
          <val-button>Accept</val-button>
        </div>
      </div>
    </val-dialog>
  `
}
