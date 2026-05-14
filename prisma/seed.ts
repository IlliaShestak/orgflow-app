import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {})
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
