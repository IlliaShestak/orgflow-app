'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

export function AttendancePanel({ activityId, attendance, availableMembers }: AttendancePanelProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const attendedIds = new Set(attendance.map((a) => a.memberId))
  const notAttended = availableMembers.filter((m) => !attendedIds.has(m.id))

  function handleMark() {
    if (!selectedMemberId) return
    setError(null)
    startTransition(async () => {
      const result = await markAttendance({ activityId, memberId: selectedMemberId })
      if (result.success) {
        setSelectedMemberId('')
      } else {
        setError(result.error ?? 'Помилка')
      }
    })
  }

  function handleRemove(memberId: string) {
    setError(null)
    startTransition(async () => {
      const result = await removeAttendance({ activityId, memberId })
      if (!result.success) setError(result.error ?? 'Помилка')
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
          <SelectTrigger className="flex-1 h-9 text-sm">
            <SelectValue placeholder="Оберіть учасника..." />
          </SelectTrigger>
          <SelectContent>
            {notAttended.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.lastName} {m.firstName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleMark}
          disabled={!selectedMemberId || isPending}
          className="bg-[#E85D04] hover:bg-[#F4845F] text-white text-xs rounded-[7px] h-9 shrink-0"
        >
          Відмітити
        </Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {attendance.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Ніхто ще не відмічений</p>
      ) : (
        <div className="space-y-1">
          {attendance.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between px-3 py-2 bg-[#F7F8FA] rounded-[8px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E85D04] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                  {a.member.firstName[0]}{a.member.lastName[0]}
                </div>
                <span className="text-sm text-gray-800">
                  {a.member.lastName} {a.member.firstName}
                </span>
              </div>
              <button
                onClick={() => handleRemove(a.memberId)}
                disabled={isPending}
                className="text-gray-400 hover:text-red-500 text-xs transition-colors"
              >
                Видалити
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-400">
        Присутніх: {attendance.length} з {availableMembers.length}
      </p>
    </div>
  )
}
