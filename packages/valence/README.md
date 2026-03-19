# @valencets/valence

[![npm](https://img.shields.io/npm/v/@valencets/valence)](https://www.npmjs.com/package/@valencets/valence)
[![Socket](https://socket.dev/api/badge/npm/package/@valencets/valence)](https://socket.dev/npm/package/@valencets/valence)
[![License](https://img.shields.io/github/license/valencets/valence)](https://github.com/valencets/valence/blob/master/LICENSE)

CLI and runtime for the [Valence](https://github.com/valencets/valence) web framework. Define your schema in TypeScript — get a database, admin UI, REST API, and analytics out of the box.

## Quick Start

```bash
npx @valencets/valence init my-app
cd my-app
pnpm dev
```

## What Gets Scaffolded

- **Collections**: `categories`, `posts`, `pages`, `users` with typed fields
- **Admin UI**: Server-rendered panel at `/admin` with richtext editing and relation dropdowns
- **Migrations**: Auto-generated SQL migrations for PostgreSQL
- **Seed Data**: A default category, welcome post, and about page
- **Dev Server**: Hot-reloading server with REST API at `/api`

## Commands

| Command | Description |
|---------|-------------|
| `valence init [name]` | Create a new project |
| `valence dev` | Start the development server |
| `valence migrate` | Run pending database migrations |
| `valence build` | Build for production |

## Documentation

See the [full documentation](https://github.com/valencets/valence/wiki) for guides on collections, fields, auth, media, and telemetry.

## License

MIT
