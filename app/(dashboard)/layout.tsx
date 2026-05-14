import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/shared/components/Sidebar'
import { TopBar } from '@/shared/components/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const role = session.user.role
  const userName = session.user.name ?? session.user.email ?? 'Користувач'

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} userName={userName} />
      <div className="flex-1 flex flex-col ml-[220px]">
        <TopBar role={role} />
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  )
}
