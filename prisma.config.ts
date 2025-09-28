import path from 'node:path'
import type { PrismaConfig } from 'prisma'
import "dotenv/config";

export default {
  schema: path.join('./src/schema/schema.prisma'),
  migrations: {
    path: path.join('./src/schema/migrations')
  },
} satisfies PrismaConfig
