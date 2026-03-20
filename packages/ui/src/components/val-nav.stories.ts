import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-nav.js'

const meta: Meta = {
  title: 'Components/Nav',
  component: 'val-nav',
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the nav'
    }
  },
  args: {
    direction: 'horizontal'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => html`
    <val-nav>
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#services">Services</a>
      <a href="#contact">Contact</a>
    </val-nav>
  `
}

export const Vertical: Story = {
  render: () => html`
    <val-nav direction="vertical" style="width: 200px;">
      <a href="#dashboard">Dashboard</a>
      <a href="#users">Users</a>
      <a href="#content">Content</a>
      <a href="#settings">Settings</a>
    </val-nav>
  `
}

export const Sidebar: Story = {
  name: 'Sidebar Navigation',
  render: () => html`
    <div style="display: flex; height: 300px; border: 1px solid var(--val-color-border); border-radius: var(--val-radius-md); overflow: hidden;">
      <div style="width: 200px; background: var(--val-color-bg-muted); padding: 16px; border-right: 1px solid var(--val-color-border);">
        <val-nav direction="vertical">
          <a href="#" style="padding: 8px; border-radius: 4px; text-decoration: none; color: var(--val-color-text);">Dashboard</a>
          <a href="#" style="padding: 8px; border-radius: 4px; text-decoration: none; color: var(--val-color-text);">Collections</a>
          <a href="#" style="padding: 8px; border-radius: 4px; text-decoration: none; color: var(--val-color-text);">Media</a>
          <a href="#" style="padding: 8px; border-radius: 4px; text-decoration: none; color: var(--val-color-text);">Settings</a>
        </val-nav>
      </div>
      <div style="flex: 1; padding: 16px; font-family: var(--val-font-sans); color: var(--val-color-text);">
        <p>Main content area</p>
      </div>
    </div>
  `
}
