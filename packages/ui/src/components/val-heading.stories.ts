import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-heading.js'

const meta: Meta = {
  title: 'Components/Heading',
  component: 'val-heading',
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: ['1', '2', '3', '4', '5', '6'],
      description: 'Heading level (1-6)'
    },
    label: {
      control: 'text',
      description: 'Heading text'
    }
  },
  args: {
    level: '2',
    label: 'Section Heading'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => html`
    <val-heading level=${args['level'] ?? '2'}>${args['label']}</val-heading>
  `
}

export const H1: Story = {
  name: 'Level 1 (H1)',
  render: () => html`
    <val-heading level="1">Page Title</val-heading>
  `
}

export const H2: Story = {
  name: 'Level 2 (H2)',
  render: () => html`
    <val-heading level="2">Section Heading</val-heading>
  `
}

export const H3: Story = {
  name: 'Level 3 (H3)',
  render: () => html`
    <val-heading level="3">Subsection Heading</val-heading>
  `
}

export const H4: Story = {
  name: 'Level 4 (H4)',
  render: () => html`
    <val-heading level="4">Sub-subsection</val-heading>
  `
}

export const AllLevels: Story = {
  name: 'All Levels',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <val-heading level="1">Level 1 — Page Title</val-heading>
      <val-heading level="2">Level 2 — Section</val-heading>
      <val-heading level="3">Level 3 — Subsection</val-heading>
      <val-heading level="4">Level 4 — Sub-subsection</val-heading>
      <val-heading level="5">Level 5 — Minor heading</val-heading>
      <val-heading level="6">Level 6 — Smallest</val-heading>
    </div>
  `
}
