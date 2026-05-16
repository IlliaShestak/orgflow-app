'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { StateBadge } from '@/shared/components/StateBadge'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
import { markAttendance, removeAttendance, syncCoverageForActivity } from '../actions/activityActions'

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
  initialAttendeeIds: string[]
  hasKnowledgeTopics: boolean
}

type StateFilter = 'Active' | 'Inactive' | 'All'
type StatusFilter = 'Observer' | 'Baby' | 'Full' | 'Alumni'

const STATUS_FILTERS: StatusFilter[] = ['Observer', 'Baby', 'Full', 'Alumni']

const stateTabLabels: Record<StateFilter, string> = {
  Active: 'Активні',
  Inactive: 'Неактивні',
  All: 'Всі',
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function AttendanceTable({
  activityId,
  members,
  initialAttendeeIds,
  hasKnowledgeTopics,
}: AttendanceTableProps) {
  const [attendeeIds, setAttendeeIds] = useState<Set<string>>(() => new Set(initialAttendeeIds))
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState<StateFilter>('Active')
  const [activeStatuses, setActiveStatuses] = useState<Set<StatusFilter>>(
    () => new Set(STATUS_FILTERS)
  )
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle')

  const [, startActionTransition] = useTransition()
  const [, startSyncTransition] = useTransition()

  const filteredMembers = members.filter((m) => {
    if (stateFilter !== 'All' && m.state !== stateFilter) return false
    if (!activeStatuses.has(m.status)) return false
    const q = search.toLowerCase()
    if (q && !`${m.lastName} ${m.firstName}`.toLowerCase().includes(q)) return false
    return true
  })

  const visibleIds = new Set(filteredMembers.map((m) => m.id))
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

  function triggerSync() {
    if (!hasKnowledgeTopics) return
    setSyncStatus('syncing')
    startSyncTransition(async () => {
      await syncCoverageForActivity(activityId)
      setSyncStatus('done')
      setTimeout(() => setSyncStatus('idle'), 2000)
    })
  }

  function handleToggle(memberId: string) {
    const isChecked = attendeeIds.has(memberId)
    setError(null)

    // Optimistic update
    setAttendeeIds((prev) => {
      const next = new Set(prev)
      if (isChecked) next.delete(memberId)
      else next.add(memberId)
      return next
    })

    startActionTransition(async () => {
      const result = isChecked
        ? await removeAttendance({ activityId, memberId })
        : await markAttendance({ activityId, memberId })

      if (!result.success) {
        // Revert optimistic update
        setAttendeeIds((prev) => {
          const next = new Set(prev)
          if (isChecked) next.add(memberId)
          else next.delete(memberId)
          return next
        })
        setError(result.error ?? 'Помилка')
      } else {
        triggerSync()
      }
    })
  }

  function handleSelectAll() {
    setError(null)
    if (allVisibleChecked) {
      // Uncheck all visible
      const toRemove = filteredMembers.filter((m) => attendeeIds.has(m.id))
      toRemove.forEach((m) => {
        setAttendeeIds((prev) => { const next = new Set(prev); next.delete(m.id); return next })
        startActionTransition(async () => {
          const result = await removeAttendance({ activityId, memberId: m.id })
          if (!result.success) {
            setAttendeeIds((prev) => { const next = new Set(prev); next.add(m.id); return next })
            setError(result.error ?? 'Помилка')
          }
        })
      })
    } else {
      // Check all visible unchecked
      const toAdd = filteredMembers.filter((m) => !attendeeIds.has(m.id))
      toAdd.forEach((m) => {
        setAttendeeIds((prev) => { const next = new Set(prev); next.add(m.id); return next })
        startActionTransition(async () => {
          const result = await markAttendance({ activityId, memberId: m.id })
          if (!result.success) {
            setAttendeeIds((prev) => { const next = new Set(prev); next.delete(m.id); return next })
            setError(result.error ?? 'Помилка')
          }
        })
      })
      if (toAdd.length > 0) triggerSync()
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
        <div className="bg-gray-50 grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.6px]">
          <input
            type="checkbox"
            checked={allVisibleChecked}
            ref={(el) => { if (el) el.indeterminate = someVisibleChecked }}
            onChange={handleSelectAll}
            className="w-3.5 h-3.5 accent-[#E85D04]"
            disabled={filteredMembers.length === 0}
          />
          <span>{'Учасник'}</span>
          <span>{'Статус'}</span>
          <span>{'Стан'}</span>
          <span>{'Дата вступу'}</span>
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
              return (
                <div
                  key={m.id}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-3 py-2.5 border-t border-gray-50 transition-colors ${
                    checked ? 'bg-[#FDF8F4]' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggle(m.id)}
                    className="w-3.5 h-3.5 accent-[#E85D04]"
                  />
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
                </div>
              )
            })
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Summary + sync status */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          {'Відмічено:'} {attendeeIds.size} {'з'} {members.length}
        </p>
        {syncStatus === 'syncing' && (
          <span className="text-[11px] text-[#E85D04] flex items-center gap-1.5">
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            {'Оновлення покриття знань...'}
          </span>
        )}
        {syncStatus === 'done' && (
          <span className="text-[11px] text-[#0B7B45]">{'✓ Покриття оновлено'}</span>
        )}
      </div>
    </div>
  )
}
