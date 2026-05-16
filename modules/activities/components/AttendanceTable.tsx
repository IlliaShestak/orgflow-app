'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { StateBadge } from '@/shared/components/StateBadge'
import { MemberAvatar } from '@/shared/components/MemberAvatar'

interface AttendanceMember {
  id: string
  firstName: string
  lastName: string
  status: 'Observer' | 'Baby' | 'Full' | 'Alumni'
  state: 'Active' | 'Inactive'
  joinedAt: Date | string
}

interface AttendanceTableProps {
  activityId: string
  members: AttendanceMember[]
  attendeeIds: Set<string>
  onAttendeeIdsChange: (ids: Set<string>) => void
}

type StateFilter = 'Active' | 'Inactive' | 'All'
type StatusFilter = 'Observer' | 'Baby' | 'Full' | 'Alumni'

const STATUS_FILTERS: StatusFilter[] = ['Observer', 'Baby', 'Full', 'Alumni']

const stateTabLabels: Record<StateFilter, string> = {
  Active: 'Активні',
  Inactive: 'Неактивні',
  All: 'Всі',
}

const STATUS_ROW_COLORS: Record<StatusFilter, { unchecked: string; checked: string }> = {
  Observer: {
    unchecked: 'bg-[#F0F4FB] hover:bg-[#E8EDF8]',
    checked: 'bg-[#E8EDF8]',
  },
  Baby: {
    unchecked: 'bg-[#FEF6F0] hover:bg-[#FDF0E8]',
    checked: 'bg-[#FDF0E8]',
  },
  Full: {
    unchecked: 'bg-[#EFF9F4] hover:bg-[#E6F5EE]',
    checked: 'bg-[#E6F5EE]',
  },
  Alumni: {
    unchecked: 'bg-gray-50 hover:bg-gray-100',
    checked: 'bg-gray-100',
  },
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function AttendanceTable({
  members,
  attendeeIds,
  onAttendeeIdsChange,
}: AttendanceTableProps) {
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState<StateFilter>('Active')
  const [activeStatuses, setActiveStatuses] = useState<Set<StatusFilter>>(
    () => new Set(STATUS_FILTERS)
  )

  const filteredMembers = members.filter((m) => {
    if (stateFilter !== 'All' && m.state !== stateFilter) return false
    if (!activeStatuses.has(m.status)) return false
    const q = search.toLowerCase()
    if (q && !`${m.lastName} ${m.firstName}`.toLowerCase().includes(q)) return false
    return true
  })

  const checkedVisible = filteredMembers.filter((m) => attendeeIds.has(m.id))
  const allVisibleChecked = filteredMembers.length > 0 && checkedVisible.length === filteredMembers.length
  const someVisibleChecked = checkedVisible.length > 0 && !allVisibleChecked

  function toggleStatus(status: StatusFilter) {
    setActiveStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  function handleToggle(memberId: string) {
    const next = new Set(attendeeIds)
    if (next.has(memberId)) next.delete(memberId)
    else next.add(memberId)
    onAttendeeIdsChange(next)
  }

  function handleSelectAll() {
    if (allVisibleChecked) {
      const next = new Set(attendeeIds)
      filteredMembers.forEach((m) => next.delete(m.id))
      onAttendeeIdsChange(next)
    } else {
      const next = new Set(attendeeIds)
      filteredMembers.forEach((m) => next.add(m.id))
      onAttendeeIdsChange(next)
    }
  }

  return (
    <div className="space-y-3">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук учасника..."
          className="h-8 text-sm w-64"
        />
        <div className="flex items-center gap-1">
          {(['Active', 'Inactive', 'All'] as StateFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setStateFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                stateFilter === tab
                  ? 'bg-[#E85D04] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {stateTabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border ${
              activeStatuses.has(status)
                ? 'bg-[#E8EDF8] text-[#0A3D91] border-[#4472CA]/30'
                : 'bg-white text-gray-400 border-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-[8px] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 grid grid-cols-[1fr_100px_90px_110px_40px] items-center px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.6px]">
          <span>{'Учасник'}</span>
          <span>{'Статус'}</span>
          <span>{'Стан'}</span>
          <span>{'Дата вступу'}</span>
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={allVisibleChecked}
              ref={(el) => { if (el) el.indeterminate = someVisibleChecked }}
              onChange={handleSelectAll}
              className="w-3.5 h-3.5 accent-[#E85D04]"
              disabled={filteredMembers.length === 0}
            />
          </div>
        </div>

        {/* Body */}
        <div className="max-h-96 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              {'Учасників не знайдено'}
            </p>
          ) : (
            filteredMembers.map((m, idx) => {
              const checked = attendeeIds.has(m.id)
              const colors = STATUS_ROW_COLORS[m.status]
              return (
                <div
                  key={m.id}
                  className={`grid grid-cols-[1fr_100px_90px_110px_40px] items-center px-3 py-2.5 border-t border-gray-50 transition-colors ${
                    checked ? colors.checked : colors.unchecked
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MemberAvatar
                      firstName={m.firstName}
                      lastName={m.lastName}
                      size="sm"
                      colorIndex={idx % 3}
                    />
                    <span className="text-sm text-gray-800 truncate">
                      {m.lastName} {m.firstName}
                    </span>
                  </div>
                  <StatusBadge status={m.status} />
                  <StateBadge state={m.state} />
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(m.joinedAt)}
                  </span>
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggle(m.id)}
                      className="w-3.5 h-3.5 accent-[#E85D04]"
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-[11px] text-gray-400">
        {'Відмічено:'} {attendeeIds.size} {'з'} {members.length}
      </p>
    </div>
  )
}
