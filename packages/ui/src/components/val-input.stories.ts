import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-input.js'

const meta: Meta = {
  title: 'Components/Input',
  component: 'val-input',
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required'
    }
  },
  args: {
    placeholder: 'Enter text...',
    type: 'text',
    disabled: false,
    required: false
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => html`
    <val-input
      placeholder=${args['placeholder'] ?? ''}
      type=${args['type'] ?? 'text'}
      ?disabled=${args['disabled']}
      ?required=${args['required']}
    >
      <span slot="label">Label</span>
    </val-input>
  `
}

export const WithLabel: Story = {
  name: 'With Label',
  render: () => html`
    <val-input placeholder="Enter your name">
      <span slot="label">Full Name</span>
    </val-input>
  `
}

export const Email: Story = {
  render: () => html`
    <val-input type="email" placeholder="you@example.com">
      <span slot="label">Email Address</span>
    </val-input>
  `
}

export const Password: Story = {
  render: () => html`
    <val-input type="password" placeholder="••••••••">
      <span slot="label">Password</span>
    </val-input>
  `
}

export const Disabled: Story = {
  render: () => html`
    <val-input disabled placeholder="Disabled input">
      <span slot="label">Disabled</span>
    </val-input>
  `
}

export const Required: Story = {
  render: () => html`
    <val-input required placeholder="Required field">
      <span slot="label">Required Field *</span>
    </val-input>
  `
}

export const WithValue: Story = {
  name: 'With Value',
  render: () => html`
    <val-input value="Pre-filled value">
      <span slot="label">Pre-filled</span>
    </val-input>
  `
}
