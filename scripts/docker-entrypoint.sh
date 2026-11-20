#!/bin/sh
set -eu

# Never silently start an ephemeral development database in the deployed image.
: "${DATABASE_URL:?Set DATABASE_URL to the Neon PostgreSQL connection string}"
: "${JWT_SECRET:?Set a strong random JWT_SECRET}"
if [ "$JWT_SECRET" = "kajok-dev-secret-change-in-production" ]; then
  echo "Refusing to use the development JWT_SECRET in production" >&2
  exit 1
fi

# Fail closed: a failed schema application must prevent the HTTP server starting.
npm run db:schema
exec "$@"
