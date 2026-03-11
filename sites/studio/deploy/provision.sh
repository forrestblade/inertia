#!/usr/bin/env bash
set -euo pipefail

# Inertia Studio — Pi 5 Provisioning Script
# Run as: sudo bash provision.sh
# Target: Raspberry Pi 5, Debian Bookworm ARM64
# Ports: external 80 → internal 5173, external 443 → internal 8443

echo "=== Inertia Studio Provisioning ==="
echo "Target: $(hostname) ($(uname -m))"
echo ""

# ----- Version locks -----
NODE_MAJOR=22
POSTGRES_VERSION=15
CADDY_VERSION="2.8.4"
CLOUDFLARED_VERSION="2024.12.2"

# ----- 1. System packages -----
echo "[1/8] Installing system packages..."
apt-get update -qq
apt-get install -y -qq \
  curl \
  gnupg \
  lsb-release \
  ca-certificates \
  git \
  build-essential

# ----- 2. Node.js -----
echo "[2/8] Installing Node.js ${NODE_MAJOR}..."
if ! command -v node &>/dev/null; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -qq nodejs
fi
node --version
npm install -g pnpm@latest

# ----- 3. PostgreSQL -----
echo "[3/8] Installing PostgreSQL ${POSTGRES_VERSION}..."
if ! command -v psql &>/dev/null; then
  apt-get install -y -qq "postgresql-${POSTGRES_VERSION}" "postgresql-contrib-${POSTGRES_VERSION}"
fi
systemctl enable postgresql
systemctl start postgresql

# Create database and user
echo "[3b/8] Setting up database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='inertia_app'" | grep -q 1 || \
  sudo -u postgres createuser inertia_app
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='inertia_studio'" | grep -q 1 || \
  sudo -u postgres createdb -O inertia_app inertia_studio

# Set password (idempotent)
sudo -u postgres psql -c "ALTER USER inertia_app WITH PASSWORD 'changeme';"

# PostgreSQL tuning for Pi 5 (4GB RAM)
PGCONF="/etc/postgresql/${POSTGRES_VERSION}/main/postgresql.conf"
if ! grep -q "# Inertia tuning" "${PGCONF}"; then
  echo "" >> "${PGCONF}"
  echo "# Inertia tuning" >> "${PGCONF}"
  echo "shared_buffers = 1GB" >> "${PGCONF}"
  echo "effective_cache_size = 2GB" >> "${PGCONF}"
  echo "work_mem = 64MB" >> "${PGCONF}"
  echo "maintenance_work_mem = 256MB" >> "${PGCONF}"
  echo "max_connections = 20" >> "${PGCONF}"
  systemctl restart postgresql
fi

# ----- 4. Caddy -----
echo "[4/8] Installing Caddy ${CADDY_VERSION}..."
if ! command -v caddy &>/dev/null; then
  curl -fsSL "https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_arm64.tar.gz" \
    -o /tmp/caddy.tar.gz
  tar -xzf /tmp/caddy.tar.gz -C /usr/local/bin caddy
  chmod +x /usr/local/bin/caddy
  rm /tmp/caddy.tar.gz
fi
caddy version

# Caddy config
mkdir -p /etc/caddy /var/log/caddy
cp /home/agent/inertia/sites/studio/deploy/Caddyfile /etc/caddy/Caddyfile

# Caddy systemd (if not already installed)
if [ ! -f /etc/systemd/system/caddy.service ]; then
  caddy environ | head -1 || true
  cat > /etc/systemd/system/caddy.service << 'CADDY_SVC'
[Unit]
Description=Caddy HTTP/2 web server
After=network.target

[Service]
Type=simple
User=caddy
Group=caddy
ExecStart=/usr/local/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
ExecReload=/usr/local/bin/caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
CADDY_SVC

  useradd --system --home /var/lib/caddy --shell /usr/sbin/nologin caddy 2>/dev/null || true
  systemctl daemon-reload
fi

systemctl enable caddy

# ----- 5. Cloudflare Tunnel -----
echo "[5/8] Installing cloudflared ${CLOUDFLARED_VERSION}..."
if ! command -v cloudflared &>/dev/null; then
  curl -fsSL "https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/cloudflared-linux-arm64.deb" \
    -o /tmp/cloudflared.deb
  dpkg -i /tmp/cloudflared.deb
  rm /tmp/cloudflared.deb
fi
cloudflared version

# ----- 6. Chromium + Lighthouse (for /audit) -----
echo "[6/8] Installing Chromium and Lighthouse..."
apt-get install -y -qq chromium-browser 2>/dev/null || apt-get install -y -qq chromium 2>/dev/null || echo "WARN: Chromium not available via apt, /audit page will be unavailable"
if command -v npm &>/dev/null; then
  npm install -g lighthouse@latest
fi

# ----- 7. Application setup -----
echo "[7/8] Setting up application..."
APP_DIR="/home/agent/inertia"

if [ ! -d "${APP_DIR}" ]; then
  echo "ERROR: Clone the repo to ${APP_DIR} first"
  echo "  git clone <repo-url> ${APP_DIR}"
  exit 1
fi

cd "${APP_DIR}"
pnpm install --frozen-lockfile

# Copy environment file if not present
if [ ! -f "${APP_DIR}/.env" ]; then
  cp sites/studio/deploy/env.production "${APP_DIR}/.env"
  echo "IMPORTANT: Edit ${APP_DIR}/.env — change DB_PASSWORD and ADMIN_TOKEN"
fi

# Install systemd service
cp sites/studio/deploy/inertia-studio.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable inertia-studio

# ----- 8. Run migrations -----
echo "[8/8] Running database migrations..."
cd "${APP_DIR}"
# Migrations run automatically on server boot via entry.ts

echo ""
echo "=== Provisioning complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit /home/agent/inertia/.env (set DB_PASSWORD, ADMIN_TOKEN)"
echo "  2. Start services:"
echo "     sudo systemctl start inertia-studio"
echo "     sudo systemctl start caddy"
echo "  3. Verify: curl http://localhost:5173/"
echo "  4. Set up Cloudflare Tunnel:"
echo "     cloudflared tunnel login"
echo "     cloudflared tunnel create inertia-studio"
echo "     cloudflared tunnel route dns inertia-studio inertiawebsolutions.com"
echo "  5. STOP and notify operator before DNS cutover"
echo ""
