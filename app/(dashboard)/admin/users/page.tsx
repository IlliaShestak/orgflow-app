import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  return (
    <div className="text-gray-400 text-sm">Користувачі — буде реалізовано</div>
  )
}
