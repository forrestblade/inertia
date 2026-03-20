#!/usr/bin/env bash
# check-bundle-size.sh — verifies that the CMS admin client bundle stays within size budget
# Fails if the gzipped bundle exceeds 100KB (102400 bytes)

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE_PATH="$REPO_ROOT/packages/cms/dist/admin-client.js"
MAX_GZIP_BYTES=102400  # 100KB

if [[ ! -f "$BUNDLE_PATH" ]]; then
  echo "ERROR: Bundle not found at $BUNDLE_PATH"
  echo "       Run 'pnpm build' before checking bundle size."
  exit 1
fi

GZIP_BYTES=$(gzip -c "$BUNDLE_PATH" | wc -c)
GZIP_KB=$(echo "scale=1; $GZIP_BYTES / 1024" | bc)

echo "=== Bundle Size Check ==="
echo ""
echo "  File:     $BUNDLE_PATH"
echo "  Gzipped:  ${GZIP_BYTES} bytes (${GZIP_KB} KB)"
echo "  Budget:   ${MAX_GZIP_BYTES} bytes (100 KB)"
echo ""

if [[ $GZIP_BYTES -gt $MAX_GZIP_BYTES ]]; then
  OVER=$(echo "scale=1; ($GZIP_BYTES - $MAX_GZIP_BYTES) / 1024" | bc)
  echo "  FAIL: Bundle exceeds 100KB gzip budget by ${OVER} KB"
  echo "        Reduce bundle size or increase the budget in scripts/check-bundle-size.sh"
  exit 1
else
  REMAINING=$(echo "scale=1; ($MAX_GZIP_BYTES - $GZIP_BYTES) / 1024" | bc)
  echo "  PASS: Bundle is within budget (${REMAINING} KB remaining)"
  exit 0
fi
