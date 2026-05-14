'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/shared/lib/utils'

interface ViewToggleProps {
  currentView: 'table' | 'kanban'
}

export function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setView(view: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-gray-100 rounded-[7px] p-[3px] flex gap-0.5">
      <button
        onClick={() => setView('table')}
        className={cn(
          'px-3 py-1.5 text-xs rounded-[5px] transition-colors',
          currentView === 'table'
            ? 'bg-white text-gray-800 shadow-sm font-medium'
            : 'text-gray-400 hover:text-gray-600'
        )}
      >
        Таблиця
      </button>
      <button
        onClick={() => setView('kanban')}
        className={cn(
          'px-3 py-1.5 text-xs rounded-[5px] transition-colors',
          currentView === 'kanban'
            ? 'bg-white text-gray-800 shadow-sm font-medium'
            : 'text-gray-400 hover:text-gray-600'
        )}
      >
        Kanban
      </button>
    </div>
  )
}
