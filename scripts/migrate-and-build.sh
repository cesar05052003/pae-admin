#!/bin/sh
set -e

MIGRATE_OUTPUT=$(prisma migrate deploy 2>&1)
MIGRATE_EXIT=$?
echo "$MIGRATE_OUTPUT"

if [ $MIGRATE_EXIT -ne 0 ]; then
  if echo "$MIGRATE_OUTPUT" | grep -q "P3005"; then
    echo "Existing database without migration history — applying baseline..."
    prisma migrate resolve --applied "20260526000000_baseline"
    prisma migrate deploy
  else
    echo "Migration failed — see error above."
    exit 1
  fi
fi

next build
