#!/bin/sh
set -e

# Try to deploy migrations.
# If the DB already has tables but no migration history (P3005),
# baseline it first so Prisma knows the starting point, then retry.
if ! prisma migrate deploy 2>&1; then
  echo "Existing database detected without migration history — applying baseline..."
  prisma migrate resolve --applied "20260526000000_baseline"
  prisma migrate deploy
fi

next build
