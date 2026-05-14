import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getTransferTypes } from '@/modules/admin/repository/referenceRepository'
import { TransferTypeRow } from '@/modules/admin/components/TransferTypeRow'
import { AddTransferTypeForm } from '@/modules/admin/components/AddTransferTypeForm'
import { EmptyState } from '@/shared/components/EmptyState'

export default async function AdminReferencesPage() {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  const transferTypes = await getTransferTypes()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">Довідники</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Довідкові дані системи</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-800">Типи передачі знань КСПЗ</span>
          <span className="text-[11px] text-gray-400">{transferTypes.length} записів</span>
        </div>

        <div className="p-4 border-b border-gray-100">
          <AddTransferTypeForm />
        </div>

        {transferTypes.length === 0 ? (
          <EmptyState
            title="Немає типів передачі знань"
            description="Додайте перший тип"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F8FA]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  Назва
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {transferTypes.map(item => (
                <TransferTypeRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
