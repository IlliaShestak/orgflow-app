import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminReferencesPage() {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  return (
    <div className="text-gray-400 text-sm">Довідники — буде реалізовано</div>
  )
}
