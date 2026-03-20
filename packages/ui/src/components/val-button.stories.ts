import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-button.js'

const meta: Meta = {
  title: 'Components/Button',
  component: 'val-button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Visual variant of the button'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled'
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state'
    },
    label: {
      control: 'text',
      description: 'Button label text'
    }
  },
  args: {
    label: 'Click me',
    disabled: false,
    loading: false
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: (args) => html`
    <val-button
      ?disabled=${args['disabled']}
      ?loading=${args['loading']}
    >${args['label']}</val-button>
  `
}

export const Secondary: Story = {
  render: (args) => html`
    <val-button
      variant="secondary"
      ?disabled=${args['disabled']}
      ?loading=${args['loading']}
    >${args['label']}</val-button>
  `
}

export const Ghost: Story = {
  render: (args) => html`
    <val-button
      variant="ghost"
      ?disabled=${args['disabled']}
      ?loading=${args['loading']}
    >${args['label']}</val-button>
  `
}

export const SizeSmall: Story = {
  name: 'Size: Small',
  render: () => html`
    <val-button size="sm">Small</val-button>
  `
}

export const SizeMedium: Story = {
  name: 'Size: Medium',
  render: () => html`
    <val-button>Medium</val-button>
  `
}

export const SizeLarge: Story = {
  name: 'Size: Large',
  render: () => html`
    <val-button size="lg">Large</val-button>
  `
}

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <val-button disabled>Primary</val-button>
      <val-button variant="secondary" disabled>Secondary</val-button>
      <val-button variant="ghost" disabled>Ghost</val-button>
    </div>
  `
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <val-button>Primary</val-button>
      <val-button variant="secondary">Secondary</val-button>
      <val-button variant="ghost">Ghost</val-button>
    </div>
  `
}

export const AllSizes: Story = {
  name: 'All Sizes',
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <val-button size="sm">Small</val-button>
      <val-button>Medium</val-button>
      <val-button size="lg">Large</val-button>
    </div>
  `
}
