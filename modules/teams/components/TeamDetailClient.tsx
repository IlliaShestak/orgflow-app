'use client'

import { useState } from 'react'
import { TeamDetailHeader } from './TeamDetailHeader'
import { PositionCard } from './PositionCard'
import { AddPositionForm } from './AddPositionForm'
import { TeamWithPositions, MemberForSelect } from '../types'

interface TeamDetailClientProps {
  team: TeamWithPositions
  allMembers: MemberForSelect[]
  canEdit: boolean
}

export function TeamDetailClient({ team, allMembers, canEdit }: TeamDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false)

  const regularPositions = team.positions.filter((p) => !p.isHelper)
  const helperPositions = team.positions.filter((p) => p.isHelper)

  const positionsEditable = canEdit && isEditing && !team.isArchived

  return (
    <>
      <TeamDetailHeader
        team={team}
        canEdit={canEdit}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />

      {positionsEditable && (
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
                  canEdit={positionsEditable}
                  allMembers={allMembers}
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
                    canEdit={positionsEditable}
                    allMembers={allMembers}
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
