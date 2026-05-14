import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getUserList, getMembersForSelect } from '@/modules/admin/repository/adminRepository'
import { UserTableRow } from '@/modules/admin/components/UserTableRow'
import { CreateUserModal } from '@/modules/admin/components/CreateUserModal'
import { EmptyState } from '@/shared/components/EmptyState'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  const [users, members] = await Promise.all([getUserList(), getMembersForSelect()])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">Користувачі</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Облікові записи для входу в систему</p>
        </div>
        <CreateUserModal members={members} />
      </div>

      <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
        {users.length === 0 ? (
          <EmptyState
            title="Немає користувачів"
            description="Створіть перший обліковий запис"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F8FA]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  Учасник
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  Роль
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  Створено
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <UserTableRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
