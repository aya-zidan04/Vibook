#!/usr/bin/env bash
# Preview or execute smoke/E2E user cleanup for MySQL.
#
# Preview (default):
#   ./backend/scripts/cleanup-smoke-test-users.sh
#
# Execute (after reviewing preview):
#   ./backend/scripts/cleanup-smoke-test-users.sh --execute
#
# Env overrides:
#   DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PREVIEW_SQL="${ROOT}/db/manual/cleanup-smoke-test-users-preview.sql"
EXECUTE_SQL="${ROOT}/db/manual/cleanup-smoke-test-users-execute.sql"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-vibook_db}"

mysql_args=(-h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --database="$DB_NAME" --table)

if [[ -n "$DB_PASSWORD" ]]; then
  export MYSQL_PWD="$DB_PASSWORD"
fi

run_sql() {
  mysql "${mysql_args[@]}" "$@"
}

if [[ "${1:-}" == "--execute" ]]; then
  echo "=== PREVIEW (re-run before delete) ==="
  run_sql < "$PREVIEW_SQL"
  echo ""
  echo "This will PERMANENTLY delete the users and related rows listed above."
  echo "ROLE_ADMIN accounts are never deleted."
  read -r -p "Type YES to run cleanup: " confirm
  if [[ "$confirm" != "YES" ]]; then
    echo "Aborted."
    exit 1
  fi
  echo "=== EXECUTING DELETE (transaction) ==="
  run_sql < "$EXECUTE_SQL"
  echo "=== POST-CLEANUP PREVIEW (should be empty) ==="
  run_sql < "$PREVIEW_SQL"
else
  echo "=== PREVIEW ONLY (no deletes) ==="
  echo "SQL: $PREVIEW_SQL"
  echo ""
  run_sql < "$PREVIEW_SQL"
  echo ""
  echo "To delete after review: ./backend/scripts/cleanup-smoke-test-users.sh --execute"
fi
