import { getKspzTables, getKspzTransferTypes } from '@/modules/knowledge/repository/kspzTableRepository'
import { AddKspzTableDialog } from '@/modules/knowledge/components/AddKspzTableDialog'
import { getSession } from '@/shared/lib/auth'
import Link from 'next/link'
import { Role, MemberStatus } from '@/generated/prisma'

const statusLabels: Record<MemberStatus, string> = {
  Observer: 'Observer',
  Baby: 'Baby',
  Full: 'Full',
  Alumni: 'Alumni',
}

export default async function KnowledgePage() {
  const [session, tables, transferTypes] = await Promise.all([
    getSession(),
    getKspzTables(),
    getKspzTransferTypes(),
  ])

  const role = session?.user?.role as Role | undefined
  const canCreate = role === Role.Admin || role === Role.VP4HR

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">КСПЗ</h1>
          <p className="text-xs text-gray-400 mt-0.5">{tables.length} таблиць знань</p>
        </div>
        {canCreate && <AddKspzTableDialog transferTypes={transferTypes} />}
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-gray-300 text-2xl">📚</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Таблиці знань відсутні</p>
          <p className="text-xs text-gray-400 mt-1">
            {canCreate ? 'Створіть першу таблицю знань' : 'Таблиці ще не створені'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <Link
              key={table.id}
              href={`/knowledge/${table.id}`}
              className="bg-white border border-gray-100 rounded-[10px] p-5 hover:shadow-md hover:border-[#E85D04] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-gray-800 group-hover:text-[#E85D04] transition-colors">
                  {table.name}
                </h3>
                {table.targetStatus && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[5px] bg-[#E8EDF8] text-[#0A3D91] shrink-0 ml-2">
                    {statusLabels[table.targetStatus]}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {table._count.topics} {table._count.topics === 1 ? 'тема' : 'тем'}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[11px] text-gray-400">
                  Створено {new Date(table.createdAt).toLocaleDateString('uk-UA')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
