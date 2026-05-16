import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { getTeamById, getMembersForSelect } from '@/modules/teams/repository/teamRepository'
import { TeamDetailHeader } from '@/modules/teams/components/TeamDetailHeader'
import { PositionCard } from '@/modules/teams/components/PositionCard'
import { AddPositionForm } from '@/modules/teams/components/AddPositionForm'
import Link from 'next/link'

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const canEdit = session?.user.role === 'Admin' || session?.user.role === 'VP4HR'

  const [team, allMembers] = await Promise.all([
    getTeamById(id),
    getMembersForSelect(),
  ])

  if (!team) notFound()

  const regularPositions = team.positions.filter((p) => !p.isHelper)
  const helperPositions = team.positions.filter((p) => p.isHelper)

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/teams" className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
            {'Команди'}
          </Link>
          <span className="text-gray-300">{'/'}</span>
          <span className="text-[13px] text-gray-800 font-medium">{team.name}</span>
        </div>

        <TeamDetailHeader team={team} canEdit={canEdit} />

        {canEdit && !team.isArchived && (
          <div className="bg-white border border-gray-100 rounded-[10px] p-4 mb-6">
            <h2 className="text-[13px] font-semibold text-gray-800 mb-3">{'Додати позицію'}</h2>
            <AddPositionForm teamId={team.id} isCoreteam={team.type === 'Coreteam'} />
          </div>
        )}

        {team.positions.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[10px] p-12 text-center">
            <p className="text-[13px] font-medium text-gray-600">{'Немає позицій'}</p>
            <p className="text-[12px] text-gray-400 mt-1">{'Додайте першу позицію команди'}</p>
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
                    canEdit={canEdit && !team.isArchived}
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
                      canEdit={canEdit && !team.isArchived}
                      allMembers={allMembers}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
