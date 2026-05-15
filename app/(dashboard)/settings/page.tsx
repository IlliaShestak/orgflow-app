import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ChangePasswordForm } from '@/modules/admin/components/ChangePasswordForm'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">Налаштування</h1>
        <p className="text-xs text-gray-400 mt-0.5">Керування обліковим записом</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[10px] p-6">
        <h2 className="text-[13px] font-semibold text-gray-800 mb-4">Зміна пароля</h2>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
