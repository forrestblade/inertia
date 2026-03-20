import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './val-table.js'
import type { ValTable } from './val-table.js'

const meta: Meta = {
  title: 'Components/Table',
  component: 'val-table',
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

const sampleColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: false },
  { key: 'status', label: 'Status', sortable: false }
]

const sampleRows = [
  { name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active' },
  { name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive' },
  { name: 'David Brown', email: 'david@example.com', role: 'Editor', status: 'Active' }
]

export const Default: Story = {
  render: () => html`
    <val-table
      id="table-default"
      style="width: 100%;"
      ${(el: ValTable) => {
        el.columns = sampleColumns
        el.rows = sampleRows
      }}
    ></val-table>
    <script>
      const t = document.getElementById('table-default');
      if (t) {
        t.columns = ${JSON.stringify(sampleColumns)};
        t.rows = ${JSON.stringify(sampleRows)};
      }
    </script>
  `
}

export const WithSorting: Story = {
  name: 'With Sorting',
  render: () => {
    const id = 'table-sortable'
    return html`
      <val-table id=${id} style="width: 100%;"></val-table>
      <script>
        (function() {
          const t = document.getElementById('${id}');
          if (!t) return;
          t.columns = ${JSON.stringify(sampleColumns)};
          t.rows = ${JSON.stringify(sampleRows)};
        })();
      </script>
    `
  }
}

export const Empty: Story = {
  name: 'Empty State',
  render: () => html`
    <val-table id="table-empty" style="width: 100%;"></val-table>
    <script>
      (function() {
        const t = document.getElementById('table-empty');
        if (!t) return;
        t.columns = [{ key: 'name', label: 'Name' }, { key: 'value', label: 'Value' }];
        t.rows = [];
      })();
    </script>
  `
}

export const ManyRows: Story = {
  name: 'Many Rows',
  render: () => {
    const manyRows = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: i % 3 === 0 ? 'Inactive' : 'Active'
    }))
    const cols = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'status', label: 'Status', sortable: false }
    ]
    return html`
      <val-table id="table-many" style="width: 100%;"></val-table>
      <script>
        (function() {
          const t = document.getElementById('table-many');
          if (!t) return;
          t.columns = ${JSON.stringify(cols)};
          t.rows = ${JSON.stringify(manyRows)};
        })();
      </script>
    `
  }
}
