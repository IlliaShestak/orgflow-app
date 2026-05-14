'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { PositionWithMemberships, MemberForSelect } from '../types'
import { assignMember } from '../actions/managePositions'
import { removeMember } from '../actions/managePositions'
import { deletePosition } from '../actions/managePositions'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { MemberAvatar } from '@/shared/components/MemberAvatar'

interface PositionCardProps {
  position: PositionWithMemberships
  teamId: string
  teamName: string
  canEdit: boolean
  allMembers: MemberForSelect[]
}

export function PositionCard({ position, teamId, teamName, canEdit, allMembers }: PositionCardProps) {
  const [showAssign, setShowAssign] = useState(false)
  const [confirmDeletePos, setConfirmDeletePos] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const currentMemberIds = new Set(position.teamMemberships.map(m => m.member.id))
  const availableMembers = allMembers.filter(m => !currentMemberIds.has(m.id))

  function handleAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('positionId', position.id)
    formData.set('teamId', teamId)
    formData.set('teamName', teamName)
    formData.set('positionName', position.name)
    startTransition(async () => {
      const result = await assignMember(formData)
      if (result?.error) setError(result.error)
      else setShowAssign(false)
    })
  }

  function handleRemove(membershipId: string) {
    const endDate = new Date().toISOString().split('T')[0]
    startTransition(async () => {
      const result = await removeMember(membershipId, teamId, endDate)
      if (result?.error) setError(result.error)
      setRemovingId(null)
    })
  }

  function handleDeletePosition() {
    startTransition(async () => {
      const result = await deletePosition(position.id, teamId)
      if (result?.error) setError(result.error)
      setConfirmDeletePos(false)
    })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-gray-800">{position.name}</span>
          {position.isHelper && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#FDF0E8] text-[#E85D04]">Helper</span>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-1">
            <button
              onClick={() => setShowAssign(true)}
              className="px-2 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-[#E85D04] hover:text-[#E85D04] transition-colors"
            >
              + Призначити
            </button>
            <button
              onClick={() => setConfirmDeletePos(true)}
              className="px-2 py-1 text-[11px] font-medium text-red-400 bg-white border border-red-100 rounded-[7px] hover:bg-red-50 transition-colors"
            >
              Видалити
            </button>
          </div>
        )}
      </div>

      {position.teamMemberships.length === 0 ? (
        <div className="px-4 py-6 text-center text-[12px] text-gray-400">Немає учасників</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {position.teamMemberships.map(m => (
            <div key={m.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemberAvatar firstName={m.member.firstName} lastName={m.member.lastName} size="sm" />
                <Link href={`/information-book/${m.member.id}`} className="text-[13px] text-gray-800 hover:text-[#E85D04] transition-colors">
                  {m.member.lastName} {m.member.firstName}
                </Link>
                <span className="text-[11px] text-gray-400">
                  з {new Date(m.startDate).toLocaleDateString('uk-UA')}
                </span>
              </div>
              {canEdit && (
                <button
                  onClick={() => setRemovingId(m.id)}
                  className="text-[11px] text-red-400 hover:text-red-600 transition-colors"
                >
                  Зняти
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="px-4 pb-3 text-[11px] text-red-500">{error}</p>}

      {showAssign && (
        <div className="px-4 py-3 border-t border-gray-100 bg-[#FAFBFD]">
          <form onSubmit={handleAssign} className="flex gap-2 flex-wrap items-end">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Учасник</label>
              <select
                name="memberId"
                required
                className="border border-gray-200 rounded-[7px] px-2 py-1.5 text-[12px] text-gray-800 focus:outline-none focus:border-[#E85D04]"
              >
                <option value="">— обрати —</option>
                {availableMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.lastName} {m.firstName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Дата початку</label>
              <input
                name="startDate"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="border border-gray-200 rounded-[7px] px-2 py-1.5 text-[12px] text-gray-800 focus:outline-none focus:border-[#E85D04]"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] disabled:opacity-50 transition-colors"
            >
              {isPending ? '...' : 'Призначити'}
            </button>
            <button
              type="button"
              onClick={() => setShowAssign(false)}
              className="px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-gray-300 transition-colors"
            >
              Скасувати
            </button>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={confirmDeletePos}
        title="Видалити позицію?"
        description={`Позиція "${position.name}" буде видалена. Це неможливо, якщо є активні учасники.`}
        confirmLabel="Видалити"
        onConfirm={handleDeletePosition}
        onCancel={() => setConfirmDeletePos(false)}
        dangerous
      />

      <ConfirmDialog
        open={!!removingId}
        title="Зняти учасника з позиції?"
        description="Учасник буде знятий з цієї позиції. Дата завершення буде встановлена на сьогодні."
        confirmLabel="Зняти"
        onConfirm={() => removingId && handleRemove(removingId)}
        onCancel={() => setRemovingId(null)}
        dangerous
      />
    </div>
  )
}
