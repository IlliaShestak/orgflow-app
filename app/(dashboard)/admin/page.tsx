import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold text-gray-900">Адмін панель</h1>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Link
          href="/admin/users"
          className="bg-white border border-gray-100 rounded-[10px] p-5 hover:shadow-sm transition-shadow"
        >
          <p className="font-semibold text-gray-800 text-sm">Користувачі</p>
          <p className="text-xs text-gray-400 mt-1">Управління акаунтами</p>
        </Link>
        <Link
          href="/admin/references"
          className="bg-white border border-gray-100 rounded-[10px] p-5 hover:shadow-sm transition-shadow"
        >
          <p className="font-semibold text-gray-800 text-sm">Довідники</p>
          <p className="text-xs text-gray-400 mt-1">Типи передачі знань</p>
        </Link>
      </div>
    </div>
  )
}
