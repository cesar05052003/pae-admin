#!/bin/sh
set -e

echo "Running database setup (enum + zone assignments)..."
node scripts/setup-db.js || echo "Warning: DB setup had errors — zones may not be fully assigned yet."

echo "Building Next.js app..."
next build
