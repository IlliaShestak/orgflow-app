import { notFound } from 'next/navigation'
import { getKspzTableById } from '@/modules/knowledge/repository/kspzTableRepository'
import { getCoverageMatrixForTable } from '@/modules/knowledge/repository/kspzCoverageRepository'
import { KspzTopicManager } from '@/modules/knowledge/components/KspzTopicManager'
import { CoverageMatrix } from '@/modules/knowledge/components/CoverageMatrix'
import { DeleteKspzTableButton } from '@/modules/knowledge/components/DeleteKspzTableButton'
import { getSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import Link from 'next/link'
import { Role, MemberStatus } from '@prisma/client'

const statusLabels: Record<MemberStatus, string> = {
  Observer: 'Observer',
  Baby: 'Baby',
  Full: 'Full',
  Alumni: 'Alumni',
}

export default async function KspzTableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [table, session] = await Promise.all([
    getKspzTableById(id),
    getSession(),
  ])

  if (!table) notFound()

  const role = session?.user?.role as Role | undefined
  const canEdit = role === Role.Admin || role === Role.VP4HR
  const canViewMatrix = role === Role.Admin || role === Role.VP4HR

  let matrixMembers: { id: string; firstName: string; lastName: string }[] = []
  let coverageRecords: { memberId: string; knowledgeTopicId: string; coveredAt: Date | null }[] = []

  if (canViewMatrix) {
    matrixMembers = await prisma.member.findMany({
      where: table.targetStatus
        ? { status: table.targetStatus, state: 'Active' }
        : { state: 'Active' },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })
    coverageRecords = await getCoverageMatrixForTable(id)
  }

  return (
    <div className="p-8">
      <Link href="/knowledge" className="text-xs text-gray-400 hover:text-gray-600 mb-4 inline-block">
        ← КСПЗ
      </Link>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">{table.name}</h1>
        {table.targetStatus && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[5px] bg-[#E8EDF8] text-[#0A3D91]">
            {statusLabels[table.targetStatus]}
          </span>
        )}
        {canEdit && (
          <div className="ml-auto">
            <DeleteKspzTableButton tableId={table.id} tableName={table.name} />
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {table.columns.map((col) => (
          <span
            key={col.knowledgeTransferTypeId}
            className="px-2 py-1 text-[11px] font-medium bg-[#E6F5EE] text-[#0B7B45] rounded-[5px]"
          >
            {col.knowledgeTransferType.name}
          </span>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-800">Теми</h2>
            <span className="text-[11px] text-gray-400">{table.topics.length} тем</span>
          </div>
          <div className="p-4">
            {canEdit ? (
              <KspzTopicManager tableId={table.id} topics={table.topics} tableColumns={table.columns} />
            ) : (
              <div className="space-y-1">
                {table.topics.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">Тем ще немає</p>
                ) : (
                  table.topics.map((topic, i) => (
                    <div key={topic.id} className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] rounded-[8px]">
                      <span className="text-[11px] text-gray-400 w-5">{i + 1}</span>
                      <span className="text-sm text-gray-800">{topic.name}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {canViewMatrix && (
          <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-gray-800">Покриття по учасниках</h2>
              <span className="text-[11px] text-gray-400">{matrixMembers.length} учасників</span>
            </div>
            <div className="p-4">
              {table.topics.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Додайте теми для перегляду матриці покриття</p>
              ) : (
                <CoverageMatrix
                  topics={table.topics}
                  members={matrixMembers}
                  coverage={coverageRecords}
                  canEdit={canEdit}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
