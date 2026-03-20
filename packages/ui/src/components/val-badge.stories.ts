import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-badge.js'

const meta: Meta = {
  title: 'Components/Badge',
  component: 'val-badge',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'success', 'error', 'warning', 'info'],
      description: 'Visual variant of the badge'
    },
    label: {
      control: 'text',
      description: 'Badge label text'
    }
  },
  args: {
    variant: 'neutral',
    label: 'Badge'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  render: (args) => html`
    <val-badge variant="neutral">${args['label']}</val-badge>
  `
}

export const Success: Story = {
  render: (args) => html`
    <val-badge variant="success">${args['label']}</val-badge>
  `
}

export const Error: Story = {
  render: (args) => html`
    <val-badge variant="error">${args['label']}</val-badge>
  `
}

export const Warning: Story = {
  render: (args) => html`
    <val-badge variant="warning">${args['label']}</val-badge>
  `
}

export const Info: Story = {
  render: (args) => html`
    <val-badge variant="info">${args['label']}</val-badge>
  `
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
      <val-badge variant="neutral">Neutral</val-badge>
      <val-badge variant="success">Success</val-badge>
      <val-badge variant="error">Error</val-badge>
      <val-badge variant="warning">Warning</val-badge>
      <val-badge variant="info">Info</val-badge>
    </div>
  `
}

export const InContext: Story = {
  name: 'In Context',
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center; font-family: var(--val-font-sans); font-size: var(--val-text-sm);">
      <span>Status:</span>
      <val-badge variant="success">Published</val-badge>
    </div>
  `
}
