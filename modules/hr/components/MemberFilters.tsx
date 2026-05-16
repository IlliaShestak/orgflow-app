'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function MemberFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  function handleChange(name: string, value: string) {
    router.push(`${pathname}?${createQueryString(name, value)}`)
  }

  const selectClass = 'px-3 py-2 text-xs border border-gray-200 rounded-[7px] bg-white focus:outline-none focus:border-[#0A3D91] transition-colors text-gray-600'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        placeholder="Пошук за ім'ям..."
        defaultValue={searchParams.get('search') ?? ''}
        onChange={e => handleChange('search', e.target.value)}
        className="px-3 py-2 text-xs border border-gray-200 rounded-[7px] focus:outline-none focus:border-[#0A3D91] transition-colors w-48"
      />
      <select
        defaultValue={searchParams.get('status') ?? ''}
        onChange={e => handleChange('status', e.target.value)}
        className={selectClass}
      >
        <option value="">Всі статуси</option>
        <option value="Observer">Observer</option>
        <option value="Baby">Baby</option>
        <option value="Full">Full</option>
        <option value="Alumni">Alumni</option>
      </select>
      <select
        defaultValue={searchParams.get('state') ?? 'Active'}
        onChange={e => handleChange('state', e.target.value)}
        className={selectClass}
      >
        <option value="all">Всі стани</option>
        <option value="Active">Активні</option>
        <option value="Inactive">Неактивні</option>
      </select>
    </div>
  )
}
