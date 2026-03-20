import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-checkbox.js'

const meta: Meta = {
  title: 'Components/Checkbox',
  component: 'val-checkbox',
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled'
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in indeterminate state'
    },
    label: {
      control: 'text',
      description: 'Label text'
    }
  },
  args: {
    checked: false,
    disabled: false,
    indeterminate: false,
    label: 'Check me'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => html`
    <val-checkbox
      ?checked=${args['checked']}
      ?disabled=${args['disabled']}
      ?indeterminate=${args['indeterminate']}
    >${args['label']}</val-checkbox>
  `
}

export const Checked: Story = {
  render: () => html`
    <val-checkbox checked>Checked</val-checkbox>
  `
}

export const Unchecked: Story = {
  render: () => html`
    <val-checkbox>Unchecked</val-checkbox>
  `
}

export const Indeterminate: Story = {
  render: () => html`
    <val-checkbox indeterminate>Indeterminate</val-checkbox>
  `
}

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <val-checkbox disabled>Disabled unchecked</val-checkbox>
      <val-checkbox checked disabled>Disabled checked</val-checkbox>
    </div>
  `
}

export const CheckboxGroup: Story = {
  name: 'Checkbox Group',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <val-checkbox checked>Option A</val-checkbox>
      <val-checkbox>Option B</val-checkbox>
      <val-checkbox checked>Option C</val-checkbox>
      <val-checkbox disabled>Option D (disabled)</val-checkbox>
    </div>
  `
}
