import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-select.js'

const meta: Meta = {
  title: 'Components/Select',
  component: 'val-select',
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required'
    }
  },
  args: {
    placeholder: 'Select an option...',
    disabled: false,
    required: false
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => html`
    <div style="width: 300px;">
      <val-select
        placeholder=${args['placeholder'] ?? 'Select...'}
        ?disabled=${args['disabled']}
        ?required=${args['required']}
      >
        <span slot="label">Choose an option</span>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </val-select>
    </div>
  `
}

export const WithLabel: Story = {
  name: 'With Label',
  render: () => html`
    <div style="width: 300px;">
      <val-select placeholder="Select a country">
        <span slot="label">Country</span>
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
        <option value="ca">Canada</option>
        <option value="au">Australia</option>
        <option value="de">Germany</option>
      </val-select>
    </div>
  `
}

export const Disabled: Story = {
  render: () => html`
    <div style="width: 300px;">
      <val-select disabled placeholder="Disabled select">
        <span slot="label">Disabled</span>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </val-select>
    </div>
  `
}

export const ManyOptions: Story = {
  name: 'Many Options (Scrollable)',
  render: () => html`
    <div style="width: 300px;">
      <val-select placeholder="Select a month">
        <span slot="label">Month</span>
        <option value="jan">January</option>
        <option value="feb">February</option>
        <option value="mar">March</option>
        <option value="apr">April</option>
        <option value="may">May</option>
        <option value="jun">June</option>
        <option value="jul">July</option>
        <option value="aug">August</option>
        <option value="sep">September</option>
        <option value="oct">October</option>
        <option value="nov">November</option>
        <option value="dec">December</option>
      </val-select>
    </div>
  `
}
