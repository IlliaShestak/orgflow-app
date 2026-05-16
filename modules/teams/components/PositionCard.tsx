'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { PositionWithMemberships, MemberForSelect, PendingChange, PendingAssign, PendingRemove } from '../types'
import { deletePosition } from '../actions/managePositions'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { MemberAvatar } from '@/shared/components/MemberAvatar'

interface PositionCardProps {
  position: PositionWithMemberships
  teamId: string
  teamName: string
  canEdit: boolean
  teamStartDate?: Date | string | null
  allMembers: MemberForSelect[]
  pendingChanges: PendingChange[]
  onPendingAssign: (change: PendingAssign) => void
  onPendingRemove: (change: PendingRemove) => void
  onCancelPendingAssign: (positionId: string, memberId: string) => void
}

export function PositionCard({
  position,
  teamId,
  teamName,
  canEdit,
  teamStartDate,
  allMembers,
  pendingChanges,
  onPendingAssign,
  onPendingRemove,
  onCancelPendingAssign,
}: PositionCardProps) {
  const defaultStartDate = teamStartDate
    ? new Date(teamStartDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]
  const usingTodayFallback = !teamStartDate
  const [showAssign, setShowAssign] = useState(false)
  const [confirmDeletePos, setConfirmDeletePos] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState<MemberForSelect | null>(null)

  const pendingRemoveIds = new Set(
    (pendingChanges.filter((c) => c.type === 'remove' && c.positionId === position.id) as PendingRemove[]).map(
      (c) => c.membershipId
    )
  )
  const pendingAssigns = pendingChanges.filter(
    (c) => c.type === 'assign' && c.positionId === position.id
  ) as PendingAssign[]

  const activeMemberships = position.teamMemberships.filter((m) => !pendingRemoveIds.has(m.id))
  const pendingAssignIds = new Set(pendingAssigns.map((p) => p.memberId))
  const currentMemberIds = new Set(activeMemberships.map((m) => m.member.id))
  const availableMembers = allMembers.filter((m) => !currentMemberIds.has(m.id) && !pendingAssignIds.has(m.id))

  const isEmpty = activeMemberships.length === 0 && pendingAssigns.length === 0

  function handleAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedMember) return
    const startDate = (e.currentTarget.elements.namedItem('startDate') as HTMLInputElement).value
    onPendingAssign({
      type: 'assign',
      positionId: position.id,
      positionName: position.name,
      memberId: selectedMember.id,
      memberFirstName: selectedMember.firstName,
      memberLastName: selectedMember.lastName,
      startDate,
    })
    setShowAssign(false)
    setSelectedMember(null)
    setMemberSearch('')
  }

  function handleOpenAssign() {
    setSelectedMember(null)
    setMemberSearch('')
    setShowAssign(true)
  }

  function handleConfirmRemove() {
    if (!removingId) return
    onPendingRemove({
      type: 'remove',
      positionId: position.id,
      membershipId: removingId,
      endDate: new Date().toISOString().split('T')[0],
    })
    setRemovingId(null)
  }

  function handleDeletePosition() {
    startTransition(async () => {
      const result = await deletePosition(position.id, teamId)
      if (result?.error) setError(result.error)
      setConfirmDeletePos(false)
    })
  }

  const filteredMembers = availableMembers.filter((m) =>
    `${m.lastName} ${m.firstName}`.toLowerCase().includes(memberSearch.toLowerCase())
  )

  return (
    <div className="bg-white border border-gray-100 rounded-[10px]">
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
              onClick={handleOpenAssign}
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

      {isEmpty ? (
        <div className="px-4 py-6 text-center text-[12px] text-gray-400">{'Немає учасників'}</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {activeMemberships.map((m) => (
            <div key={m.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemberAvatar firstName={m.member.firstName} lastName={m.member.lastName} size="sm" />
                <Link
                  href={`/information-book/${m.member.id}`}
                  className="text-[13px] text-gray-800 hover:text-[#E85D04] transition-colors"
                >
                  {m.member.lastName} {m.member.firstName}
                </Link>
                <span className="text-[11px] text-gray-400">
                  {'з'} {new Date(m.startDate).toLocaleDateString('uk-UA')}
                </span>
              </div>
              {canEdit && (
                <button
                  onClick={() => setRemovingId(m.id)}
                  className="text-[11px] text-red-400 hover:text-red-600 transition-colors"
                >
                  {'Зняти'}
                </button>
              )}
            </div>
          ))}

          {pendingAssigns.map((pa) => (
            <div key={pa.memberId} className="px-4 py-3 flex items-center justify-between bg-[#FFFBF5]">
              <div className="flex items-center gap-2">
                <MemberAvatar firstName={pa.memberFirstName} lastName={pa.memberLastName} size="sm" />
                <span className="text-[13px] text-gray-700">
                  {pa.memberLastName} {pa.memberFirstName}
                </span>
                <span className="text-[10px] font-medium text-[#E85D04] bg-[#FDF0E8] px-1.5 py-0.5 rounded">
                  {'не збережено'}
                </span>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onCancelPendingAssign(position.id, pa.memberId)}
                  className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="px-4 pb-3 text-[11px] text-red-500">{error}</p>}

      {showAssign && (
        <div className="px-4 py-3 border-t border-gray-100 bg-[#FAFBFD] rounded-b-[10px]">
          <form onSubmit={handleAssign}>
            <div className="mb-3">
              <label className="block text-[10px] text-gray-400 mb-1.5">{'Учасник'}</label>
              {selectedMember ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E8EDF8] text-[#0A3D91] text-[12px] font-medium rounded-[6px]">
                    {selectedMember.lastName} {selectedMember.firstName}
                    <button
                      type="button"
                      onClick={() => { setSelectedMember(null); setMemberSearch('') }}
                      className="text-[#4472CA] hover:text-[#0A3D91] leading-none"
                    >
                      ×
                    </button>
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Пошук учасника..."
                    autoFocus
                    className="w-full border border-gray-200 rounded-[7px] px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors"
                  />
                  {filteredMembers.length > 0 && (
                    <div className="absolute bottom-full mb-1 z-20 w-full bg-white border border-gray-200 rounded-[7px] shadow-md max-h-[160px] overflow-y-auto">
                      {filteredMembers.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMember(m)}
                          className="w-full text-left px-3 py-2 text-[12px] text-gray-800 hover:bg-[#FDF0E8] hover:text-[#E85D04] transition-colors"
                        >
                          {m.lastName} {m.firstName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 items-end flex-wrap">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">{'Дата початку'}</label>
                <input
                  name="startDate"
                  type="date"
                  required
                  defaultValue={defaultStartDate}
                  className="border border-gray-200 rounded-[7px] px-2 py-1.5 text-[12px] text-gray-800 focus:outline-none focus:border-[#E85D04]"
                />
                {usingTodayFallback && (
                  <p className="text-[10px] text-yellow-500 mt-1">
                    {'Дата початку команди не вказана — встановлено сьогодні'}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={!selectedMember}
                className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] disabled:opacity-50 transition-colors"
              >
                {'Призначити'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAssign(false); setSelectedMember(null); setMemberSearch('') }}
                className="px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-gray-300 transition-colors"
              >
                {'Скасувати'}
              </button>
            </div>
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
        description="Учасник буде знятий з цієї позиції після збереження команди."
        confirmLabel="Зняти"
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemovingId(null)}
        dangerous
      />
    </div>
  )
}
