#!/bin/sh

# For Neon databases the DATABASE_URL points to the connection pooler,
# which does not support pg_advisory_lock (used by prisma migrate).
# Strip "-pooler" from the hostname to get the direct connection URL.
MIGRATION_URL=$(echo "$DATABASE_URL" | sed 's/-pooler//')

echo "Running migrations..."
if DATABASE_URL="$MIGRATION_URL" prisma migrate deploy 2>&1 | tee /tmp/migrate_out.txt; then
  echo "Migrations applied successfully."
else
  if grep -q "P3005" /tmp/migrate_out.txt; then
    echo "Existing database without migration history — applying baseline..."
    DATABASE_URL="$MIGRATION_URL" prisma migrate resolve --applied "20260526000000_baseline"
    DATABASE_URL="$MIGRATION_URL" prisma migrate deploy
  else
    echo "Migration failed. See output above."
    exit 1
  fi
fi

next build
