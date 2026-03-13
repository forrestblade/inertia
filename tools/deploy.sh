#!/usr/bin/env bash
set -euo pipefail

# Inertia Studio — Pi deploy script
# Usage: ./tools/deploy.sh [branch]
# Defaults to master. Pulls, installs, builds, restarts service.

REMOTE_USER="agent"
REMOTE_HOST="192.168.1.34"
REMOTE_DIR="/home/agent/inertia"
BRANCH="${1:-master}"
SERVICE="inertia-studio"

SSH="sshpass -p node ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"

echo "=== Deploying ${BRANCH} to ${REMOTE_HOST} ==="

# Step 1: Pull latest code
echo "[1/5] Pulling ${BRANCH}..."
$SSH "cd ${REMOTE_DIR} && git fetch origin && git checkout ${BRANCH} && git pull origin ${BRANCH}"

# Step 2: Install dependencies
echo "[2/5] Installing dependencies..."
$SSH "cd ${REMOTE_DIR} && pnpm install --frozen-lockfile"

# Step 3: Build all packages
echo "[3/5] Building..."
$SSH "cd ${REMOTE_DIR} && pnpm build"

# Step 4: Restart service
echo "[4/5] Restarting ${SERVICE}..."
$SSH "sudo systemctl restart ${SERVICE}"

# Step 5: Verify
echo "[5/5] Verifying..."
sleep 3
$SSH "systemctl is-active ${SERVICE} && echo '${SERVICE}: RUNNING' || echo '${SERVICE}: FAILED'"
STATUS=$($SSH "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null || echo 'UNREACHABLE'")
echo "Health check: HTTP ${STATUS}"

echo "=== Deploy complete ==="
