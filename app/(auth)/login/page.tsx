import { LoginForm } from '@/modules/hr/components/LoginForm'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-[8px] bg-gradient-to-br from-[#E85D04] to-[#0A3D91] flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">OrgFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Вхід до системи</h1>
          <p className="text-sm text-gray-500 mt-1">Введіть свої облікові дані</p>
        </div>
        <div className="bg-white rounded-[10px] border border-gray-100 p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
