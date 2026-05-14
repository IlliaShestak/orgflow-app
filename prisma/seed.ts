import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
const adapter = new PrismaNeonHttp(sql)
const prisma = new PrismaClient({ adapter })

async function main() {
  const transferTypes = ['Training', 'Sharing', 'Workshop', 'Mentoring', 'Self-study']

  for (const name of transferTypes) {
    await prisma.knowledgeTransferType.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('Seeded knowledge_transfer_types:', transferTypes)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
