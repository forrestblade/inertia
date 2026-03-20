import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-textarea.js'

const meta: Meta = {
  title: 'Components/Textarea',
  component: 'val-textarea',
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the textarea is required'
    },
    autoresize: {
      control: 'boolean',
      description: 'Whether the textarea auto-resizes to content'
    },
    rows: {
      control: 'number',
      description: 'Number of visible rows'
    }
  },
  args: {
    placeholder: 'Enter text...',
    disabled: false,
    required: false,
    autoresize: false,
    rows: 4
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => html`
    <val-textarea
      placeholder=${args['placeholder'] ?? ''}
      rows=${args['rows'] ?? 4}
      ?disabled=${args['disabled']}
      ?required=${args['required']}
      ?autoresize=${args['autoresize']}
    >
      <span slot="label">Message</span>
    </val-textarea>
  `
}

export const WithLabel: Story = {
  name: 'With Label',
  render: () => html`
    <val-textarea placeholder="Tell us about yourself...">
      <span slot="label">Bio</span>
    </val-textarea>
  `
}

export const Disabled: Story = {
  render: () => html`
    <val-textarea disabled placeholder="Disabled textarea">
      <span slot="label">Disabled</span>
    </val-textarea>
  `
}

export const Autoresize: Story = {
  name: 'Auto Resize',
  render: () => html`
    <val-textarea autoresize placeholder="Type to expand...">
      <span slot="label">Auto-expanding textarea</span>
    </val-textarea>
  `
}

export const WithValue: Story = {
  name: 'With Value',
  render: () => html`
    <val-textarea value="This is some pre-filled content that spans multiple lines to show how the textarea handles longer text.">
      <span slot="label">Pre-filled Content</span>
    </val-textarea>
  `
}

export const SmallRows: Story = {
  name: 'Small (2 rows)',
  render: () => html`
    <val-textarea rows="2" placeholder="Brief description">
      <span slot="label">Short Description</span>
    </val-textarea>
  `
}
