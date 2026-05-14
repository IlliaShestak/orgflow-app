import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function InformationBookPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div>
      <h1 className="text-[22px] font-bold text-gray-900 mb-6">Information book</h1>
      <div className="text-gray-400 text-sm">Список учасників — буде реалізовано в Task #2</div>
    </div>
  )
}
