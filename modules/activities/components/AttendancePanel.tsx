'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { markAttendance, removeAttendance } from '../actions/activityActions'

interface AttendanceRecord {
  id: string
  memberId: string
  member: { id: string; firstName: string; lastName: string }
}

interface MemberOption {
  id: string
  firstName: string
  lastName: string
}

interface AttendancePanelProps {
  activityId: string
  attendance: AttendanceRecord[]
  availableMembers: MemberOption[]
}

export function AttendancePanel({
  activityId,
  attendance: initialAttendance,
  availableMembers,
}: AttendancePanelProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const attendedIds = new Set(attendance.map((a) => a.memberId))

  const notAttended = availableMembers.filter((m) => {
    if (attendedIds.has(m.id)) return false
    const q = search.toLowerCase()
    return !q || `${m.lastName} ${m.firstName}`.toLowerCase().includes(q)
  })

  function handleMark(memberId: string) {
    setError(null)
    startTransition(async () => {
      const result = await markAttendance({ activityId, memberId })
      if (!result.success) {
        setError(result.error ?? 'Помилка')
      } else {
        const member = availableMembers.find((m) => m.id === memberId)
        if (member) {
          setAttendance((prev) => [
            ...prev,
            {
              id: `${activityId}-${memberId}`,
              memberId,
              member: { id: member.id, firstName: member.firstName, lastName: member.lastName },
            },
          ])
        }
      }
    })
  }

  function handleRemove(memberId: string) {
    setError(null)
    startTransition(async () => {
      const result = await removeAttendance({ activityId, memberId })
      if (!result.success) {
        setError(result.error ?? 'Помилка')
      } else {
        setAttendance((prev) => prev.filter((a) => a.memberId !== memberId))
      }
    })
  }

  return (
    <div className="space-y-3">
      {attendance.length > 0 && (
        <div className="space-y-1.5">
          {attendance.map((a) => (
            <div
              key={a.memberId}
              className="flex items-center justify-between px-3 py-2 bg-[#F7F8FA] rounded-[8px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E85D04] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                  {a.member.firstName[0]}
                  {a.member.lastName[0]}
                </div>
                <span className="text-sm text-gray-800">
                  {a.member.lastName} {a.member.firstName}
                </span>
              </div>
              <button
                onClick={() => handleRemove(a.memberId)}
                disabled={isPending}
                className="text-gray-400 hover:text-red-500 text-xs transition-colors disabled:opacity-50"
              >
                Видалити
              </button>
            </div>
          ))}
        </div>
      )}

      {availableMembers.length > attendance.length && (
        <div className="space-y-1.5">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук учасника..."
            className="h-8 text-sm"
          />
          <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-[7px]">
            {notAttended.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400 text-center">
                {search ? 'Учасників не знайдено' : 'Всі учасники вже присутні'}
              </p>
            ) : (
              notAttended.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMark(m.id)}
                  disabled={isPending}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#E8EDF8] transition-colors border-b border-gray-50 last:border-0 disabled:opacity-50"
                >
                  {m.lastName} {m.firstName}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <p className="text-[11px] text-gray-400">
        {'Присутніх:'} {attendance.length} {'з'} {availableMembers.length}
      </p>
    </div>
  )
}
