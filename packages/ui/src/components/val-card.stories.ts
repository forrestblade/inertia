import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-card.js'

const meta: Meta = {
  title: 'Components/Card',
  component: 'val-card',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'flat', 'muted'],
      description: 'Visual variant of the card'
    },
    padding: {
      control: 'select',
      options: ['0', '1', '2', '3', '4', '5', '6', '8'],
      description: 'Padding scale value'
    }
  },
  args: {
    variant: 'default',
    padding: '4'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => html`
    <val-card
      variant=${args['variant'] !== 'default' ? args['variant'] : null}
      padding=${args['padding'] ?? '4'}
      style="max-width: 400px;"
    >
      <div style="font-family: var(--val-font-sans); color: var(--val-color-text);">
        <h3 style="margin: 0 0 8px; font-size: var(--val-text-lg); font-weight: var(--val-weight-semibold);">
          Card Title
        </h3>
        <p style="margin: 0; color: var(--val-color-text-muted); font-size: var(--val-text-sm);">
          Card content goes here. This is a flexible container for any content.
        </p>
      </div>
    </val-card>
  `
}

export const Flat: Story = {
  render: () => html`
    <val-card variant="flat" style="max-width: 400px;">
      <div style="font-family: var(--val-font-sans); color: var(--val-color-text);">
        <h3 style="margin: 0 0 8px; font-size: var(--val-text-lg); font-weight: var(--val-weight-semibold);">
          Flat Card
        </h3>
        <p style="margin: 0; color: var(--val-color-text-muted); font-size: var(--val-text-sm);">
          No shadow, just a border.
        </p>
      </div>
    </val-card>
  `
}

export const Muted: Story = {
  render: () => html`
    <val-card variant="muted" style="max-width: 400px;">
      <div style="font-family: var(--val-font-sans); color: var(--val-color-text);">
        <h3 style="margin: 0 0 8px; font-size: var(--val-text-lg); font-weight: var(--val-weight-semibold);">
          Muted Card
        </h3>
        <p style="margin: 0; color: var(--val-color-text-muted); font-size: var(--val-text-sm);">
          Muted background for secondary content.
        </p>
      </div>
    </val-card>
  `
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
      <val-card>
        <div style="font-family: var(--val-font-sans); color: var(--val-color-text);">
          <strong>Default</strong> — elevated background with shadow
        </div>
      </val-card>
      <val-card variant="flat">
        <div style="font-family: var(--val-font-sans); color: var(--val-color-text);">
          <strong>Flat</strong> — elevated background, no shadow
        </div>
      </val-card>
      <val-card variant="muted">
        <div style="font-family: var(--val-font-sans); color: var(--val-color-text);">
          <strong>Muted</strong> — muted background, no shadow
        </div>
      </val-card>
    </div>
  `
}

export const CardGrid: Story = {
  name: 'Card Grid',
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      ${[1, 2, 3].map(i => html`
        <val-card>
          <div style="font-family: var(--val-font-sans); color: var(--val-color-text);">
            <h4 style="margin: 0 0 8px; font-weight: var(--val-weight-semibold);">Card ${i}</h4>
            <p style="margin: 0; color: var(--val-color-text-muted); font-size: var(--val-text-sm);">
              Sample card content.
            </p>
          </div>
        </val-card>
      `)}
    </div>
  `
}
