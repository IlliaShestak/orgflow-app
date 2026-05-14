import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role === 'Admin') redirect('/information-book')

  return (
    <div className="text-gray-400 text-sm">Профіль — буде реалізовано</div>
  )
}
