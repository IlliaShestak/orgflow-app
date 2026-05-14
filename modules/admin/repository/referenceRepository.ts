import { prisma } from '@/shared/lib/prisma'
import { TransferType } from '../types'

export async function getTransferTypes(): Promise<TransferType[]> {
  return prisma.knowledgeTransferType.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function createTransferType(name: string): Promise<TransferType> {
  return prisma.knowledgeTransferType.create({
    data: { name },
  })
}

export async function updateTransferType(id: string, name: string): Promise<TransferType> {
  return prisma.knowledgeTransferType.update({
    where: { id },
    data: { name },
  })
}

export async function deleteTransferType(id: string): Promise<void> {
  const usedInTable = await prisma.knowledgeTableColumn.findFirst({
    where: { knowledgeTransferTypeId: id },
  })
  if (usedInTable) {
    throw new Error('Цей тип передачі знань використовується в таблицях КСПЗ і не може бути видалений')
  }
  await prisma.knowledgeTransferType.delete({ where: { id } })
}
