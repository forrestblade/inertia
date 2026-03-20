import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-toggle.js'

const meta: Meta = {
  title: 'Components/Toggle',
  component: 'val-toggle',
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the toggle is on'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled'
    },
    label: {
      control: 'text',
      description: 'Label text'
    }
  },
  args: {
    checked: false,
    disabled: false,
    label: 'Enable feature'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => html`
    <val-toggle
      ?checked=${args['checked']}
      ?disabled=${args['disabled']}
    >${args['label']}</val-toggle>
  `
}

export const On: Story = {
  render: () => html`
    <val-toggle checked>Feature enabled</val-toggle>
  `
}

export const Off: Story = {
  render: () => html`
    <val-toggle>Feature disabled</val-toggle>
  `
}

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <val-toggle disabled>Disabled off</val-toggle>
      <val-toggle checked disabled>Disabled on</val-toggle>
    </div>
  `
}

export const ToggleGroup: Story = {
  name: 'Settings Group',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px; font-family: var(--val-font-sans);">
      <val-toggle checked>Dark mode</val-toggle>
      <val-toggle>Notifications</val-toggle>
      <val-toggle checked>Auto-save</val-toggle>
      <val-toggle disabled>Beta features (unavailable)</val-toggle>
    </div>
  `
}
