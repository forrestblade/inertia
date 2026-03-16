# Deployment

Build pipeline, appliance deployment, VPS relay, and gliding failover.

## Build Pipeline

```bash
pnpm build
```

Runs `tsc` across all workspaces via `pnpm -r run build`. Build order follows the workspace dependency graph — packages build before sites.

Output goes to `dist/` in each package/site directory. The `dist/` directories are gitignored.

### What gets generated at boot (not build time)

The studio server generates these assets during its boot sequence (`sites/studio/server/entry.ts`):

1. **Theme CSS** — `public/css/studio.css` via the token pipeline (`generateCSS()`)
2. **Client JS** — `public/js/boot.js` (public-facing) and `public/js/admin.js` (admin dashboard)
3. **Critical CSS** — extracted and cached by the critical CSS pipeline for 14kB budget compliance

These files are written to `sites/studio/public/` and served as static assets. They regenerate on every server restart.

## Full Validation

Before deploying, run the complete validation pipeline:

```bash
pnpm validate
```

This runs: typecheck → lint → pattern audit → budget audit → Lighthouse audit. All must pass.

## Appliance Deployment

The production target is a fanless x86 mini-PC running the full stack locally. The site lives on the appliance, not the cloud.

### Deploy steps

```bash
# SSH into the appliance
ssh agent@192.168.1.34

# Pull latest code
cd /path/to/inertia && git pull

# Install dependencies and build
pnpm install && pnpm build

# Restart the service
sudo systemctl restart inertia-studio

# Verify
curl -s http://localhost:3000/health
# Should return: OK
```

### systemd service

The server runs as a systemd service. Key commands:

```bash
sudo systemctl status inertia-studio    # Check status
sudo systemctl restart inertia-studio   # Restart after deploy
sudo journalctl -u inertia-studio -f    # Tail logs
```

The service runs `node dist/server/entry.js` with environment variables loaded from the service file or an env file.

## VPS / Caddy Relay

The appliance is not directly exposed to the internet. Instead:

1. Appliance establishes a persistent outbound **WireGuard tunnel** to a stateless VPS
2. VPS runs **Caddy** as a reverse proxy — handles public traffic + TLS termination
3. Caddy pipes requests down the tunnel to the appliance

The VPS is disposable. If it dies, spin a new one, configure WireGuard + Caddy, done. The site data lives on the appliance.

### Caddy config (on VPS)

Caddy reverse-proxies to the appliance's WireGuard IP:

```
yourdomain.com {
    reverse_proxy appliance-wireguard-ip:3000
}
```

Caddy handles automatic HTTPS via Let's Encrypt.

## Gliding Failover

If the appliance goes offline, the public site stays up via a static snapshot.

### How it works

1. On every CMS publish (or scheduled interval), the appliance compiles a **static HTML snapshot** of all public pages
2. The snapshot is **rsynced to the VPS**
3. Caddy is configured with a fallback: if the reverse proxy upstream is unreachable, serve the static snapshot
4. Dynamic features (telemetry, admin dashboard) pause, but the public storefront never goes dark
5. When the appliance reconnects, live serving resumes automatically

### Verifying failover

1. Stop the studio service on the appliance
2. Visit the public URL — should serve the static snapshot
3. Restart the service — live serving resumes

## Rollback

If a deploy introduces a regression:

```bash
# On the appliance
cd /path/to/inertia

# Check recent commits
git log --oneline -10

# Revert to the previous known-good commit
git checkout <commit-hash>

# Rebuild and restart
pnpm install && pnpm build
sudo systemctl restart inertia-studio

# Verify
curl -s http://localhost:3000/health
```

The database uses append-only migrations with idempotent SQL, so rolling back the code does not require rolling back the schema.

## Port Mapping

| External | Internal | Protocol | Purpose |
|----------|----------|----------|---------|
| 80 | 5173 | TCP/UDP | HTTP (redirects to HTTPS at Caddy) |
| 443 | 8443 | TCP/UDP | HTTPS (terminates at Caddy on VPS) |
| — | 3000 | TCP | Studio dev server (local only) |

## Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) § Infrastructure Model — WireGuard + VPS + gliding failover design
- [ARCHITECTURE.md](./ARCHITECTURE.md) § Gliding Failover — detailed failover mechanics
- [GETTING-STARTED.md](./GETTING-STARTED.md) — local development setup
