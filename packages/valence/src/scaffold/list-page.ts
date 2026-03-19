import type { CollectionConfig } from '@valencets/cms'

function pascalCase (slug: string): string {
  return slug.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
}

function singularize (slug: string): string {
  if (slug.endsWith('ies')) return slug.slice(0, -3) + 'y'
  if (slug.endsWith('ses')) return slug.slice(0, -2)
  if (slug.endsWith('s')) return slug.slice(0, -1)
  return slug
}

export function generateListPage (collection: CollectionConfig): string {
  const label = collection.labels?.plural ?? pascalCase(collection.slug)
  const singular = collection.labels?.singular ?? pascalCase(singularize(collection.slug))
  const titleField = collection.fields.find(f => f.type === 'text')?.name ?? 'id'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${label}</title>
  <link rel="stylesheet" href="/src/app/styles.css">
  <style>
    .page { max-width: 720px; margin: 0 auto; padding: var(--val-space-8) var(--val-space-4); }
    .page h1 {
      font-size: var(--val-text-2xl);
      font-weight: var(--val-weight-bold);
      margin-bottom: var(--val-space-6);
    }
    .list { list-style: none; display: flex; flex-direction: column; gap: var(--val-space-3); }
    .list-item {
      display: block;
      padding: var(--val-space-4);
      border: 1px solid var(--val-color-border);
      border-radius: var(--val-radius-lg);
      text-decoration: none;
      color: var(--val-color-text);
      transition: border-color var(--val-duration-fast);
    }
    .list-item:hover { border-color: var(--val-color-primary); }
    .list-item h2 {
      font-size: var(--val-text-base);
      font-weight: var(--val-weight-medium);
      font-family: var(--val-font-sans);
    }
    .list-item time {
      font-size: var(--val-text-xs);
      color: var(--val-color-text-muted);
    }
    .empty {
      color: var(--val-color-text-muted);
      padding: var(--val-space-8) 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="page">
    <h1>${label}</h1>
    <ul class="list" id="list"></ul>
    <p class="empty" id="empty" hidden>No ${label.toLowerCase()} yet. Create one in the <a href="/admin/${collection.slug}">admin panel</a>.</p>
  </div>

  <script type="module">
    const res = await fetch('/api/${collection.slug}')
    if (res.ok) {
      const items = await res.json()
      const list = document.getElementById('list')
      const empty = document.getElementById('empty')
      if (items.length === 0) {
        empty.hidden = false
      }
      for (const item of items) {
        const a = document.createElement('a')
        a.className = 'list-item'
        a.href = '/${collection.slug}/' + item.id
        a.innerHTML = '<h2>' + (item.${titleField} ?? '${singular}') + '</h2>'
          + (item.createdAt ? '<time>' + new Date(item.createdAt).toLocaleDateString() + '</time>' : '')
        list.appendChild(a)
      }
    }
  </script>
</body>
</html>
`
}
