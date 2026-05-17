'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const breadcrumbMap: Record<string, string> = {
  'information-book': 'Information book',
  teams: 'Команди',
  activities: 'Заходи',
  knowledge: 'КСПЗ',
  profile: 'Профіль',
  admin: 'Адмін',
  settings: 'Налаштування',
}

interface TopBarProps {
  role: string
  userName: string
  actions?: React.ReactNode
}

export function TopBar({ role, userName, actions }: TopBarProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const currentSegment = segments[0] ?? ''
  const pageTitle = breadcrumbMap[currentSegment] ?? currentSegment

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">OrgFlow</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium">{pageTitle}</span>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {role !== 'Admin' && (
          <Link
            href="/profile"
            className="flex items-center gap-2 px-2 py-1 rounded-[7px] hover:bg-gray-50 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#E85D04] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-semibold">
                {userName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-[12px] font-medium text-gray-700">{userName}</span>
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Вийти
        </button>
      </div>
    </header>
  )
}
