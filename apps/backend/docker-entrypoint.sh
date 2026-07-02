#!/bin/sh
set -eu

npm run prisma:generate --workspace @enterprise/backend
npx prisma db push --schema packages/shared/prisma/schema.prisma
exec npm run start --workspace @enterprise/backend
