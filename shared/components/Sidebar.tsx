'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/utils'

interface NavItem {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: '/information-book', label: 'Information book' },
  { href: '/teams', label: 'Команди' },
  { href: '/activities', label: 'Заходи' },
  { href: '/knowledge', label: 'КСПЗ' },
]

interface SidebarProps {
  role: string
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] min-h-screen bg-[#1A1D2E] flex flex-col fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[7px] bg-gradient-to-br from-[#E85D04] to-[#0A3D91] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">O</span>
          </div>
          <span className="text-white font-semibold text-[15px]">OrgFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[9px] font-semibold tracking-[1.2px] uppercase text-white/25 px-2 mb-2">
          Навігація
        </p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-[7px] text-[13px] transition-colors relative',
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/55 hover:bg-white/6 hover:text-white/85'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#E85D04] rounded-r-full" />
              )}
              {item.label}
            </Link>
          )
        })}

        {role === 'Admin' && (
          <>
            <p className="text-[9px] font-semibold tracking-[1.2px] uppercase text-white/25 px-2 mt-4 mb-2">
              Адміністрування
            </p>
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-[7px] text-[13px] transition-colors relative',
                pathname.startsWith('/admin')
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/55 hover:bg-white/6 hover:text-white/85'
              )}
            >
              {pathname.startsWith('/admin') && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#E85D04] rounded-r-full" />
              )}
              Адмін
            </Link>
          </>
        )}
      </nav>

      {/* User card */}
      <div className="px-3 py-4 border-t border-white/8">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-[#E85D04] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-semibold">
              {userName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white/85 text-[12px] font-medium truncate">{userName}</p>
            <p className="text-white/35 text-[10px] truncate">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
