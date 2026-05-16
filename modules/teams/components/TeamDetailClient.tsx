'use client'

import { useState } from 'react'
import { TeamDetailHeader } from './TeamDetailHeader'
import { PositionCard } from './PositionCard'
import { AddPositionForm } from './AddPositionForm'
import { TeamWithPositions, MemberForSelect, PendingChange, PendingAssign, PendingRemove } from '../types'
import { saveTeamWithChanges } from '../actions/updateTeam'

interface TeamDetailClientProps {
  team: TeamWithPositions
  allMembers: MemberForSelect[]
  canEdit: boolean
}

function toDateString(date: Date | string | null): string {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TeamDetailClient({ team, allMembers, canEdit }: TeamDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [liveStartDate, setLiveStartDate] = useState(() => toDateString(team.startDate))

  const regularPositions = team.positions.filter((p) => !p.isHelper)
  const helperPositions = team.positions.filter((p) => p.isHelper)

  const canManagePositions = canEdit && isEditing && !team.isArchived
  const canEditMembers = canEdit && isEditing

  async function handleSave(formData: FormData): Promise<{ error?: string } | undefined> {
    const assigns = (pendingChanges.filter((c) => c.type === 'assign') as PendingAssign[]).map((c) => ({
      positionId: c.positionId,
      positionName: c.positionName,
      memberId: c.memberId,
      startDate: c.startDate,
    }))
    const removes = (pendingChanges.filter((c) => c.type === 'remove') as PendingRemove[]).map((c) => ({
      membershipId: c.membershipId,
      endDate: c.endDate,
    }))

    const result = await saveTeamWithChanges(formData, assigns, removes)
    if (result?.error) return result

    setPendingChanges([])
    setIsEditing(false)
  }

  function handleCancelEdit() {
    setPendingChanges([])
    setLiveStartDate(toDateString(team.startDate))
    setIsEditing(false)
  }

  function handlePendingAssign(change: PendingAssign) {
    setPendingChanges((prev) => [...prev, change])
  }

  function handlePendingRemove(change: PendingRemove) {
    setPendingChanges((prev) => [...prev, change])
  }

  function handleCancelPendingAssign(positionId: string, memberId: string) {
    setPendingChanges((prev) =>
      prev.filter((c) => !(c.type === 'assign' && c.positionId === positionId && c.memberId === memberId))
    )
  }

  return (
    <>
      <TeamDetailHeader
        team={team}
        canEdit={canEdit}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={handleCancelEdit}
        onSave={handleSave}
        onStartDateChange={setLiveStartDate}
      />

      {canManagePositions && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-4 mb-6">
          <h2 className="text-[13px] font-semibold text-gray-800 mb-3">{'Додати позицію'}</h2>
          <AddPositionForm teamId={team.id} isCoreteam={team.type === 'Coreteam'} />
        </div>
      )}

      {team.positions.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[10px] p-12 text-center">
          <p className="text-[13px] font-medium text-gray-600">{'Немає позицій'}</p>
          <p className="text-[12px] text-gray-400 mt-1">
            {canEdit
              ? 'Натисніть «Редагувати», щоб додати позиції'
              : 'Позиції ще не додано'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {regularPositions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {regularPositions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  teamId={team.id}
                  teamName={team.name}
                  canEdit={canEditMembers}
                  teamStartDate={liveStartDate || null}
                  allMembers={allMembers}
                  pendingChanges={pendingChanges}
                  onPendingAssign={handlePendingAssign}
                  onPendingRemove={handlePendingRemove}
                  onCancelPendingAssign={handleCancelPendingAssign}
                />
              ))}
            </div>
          )}

          {helperPositions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.8px]">
                  {'Helpers'}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {helperPositions.map((position) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    teamId={team.id}
                    teamName={team.name}
                    canEdit={canEditMembers}
                    teamStartDate={liveStartDate || null}
                    allMembers={allMembers}
                    pendingChanges={pendingChanges}
                    onPendingAssign={handlePendingAssign}
                    onPendingRemove={handlePendingRemove}
                    onCancelPendingAssign={handleCancelPendingAssign}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
