import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { getTeamById, getMembersForSelect } from '@/modules/teams/repository/teamRepository'
import { PositionCard } from '@/modules/teams/components/PositionCard'
import { AddPositionForm } from '@/modules/teams/components/AddPositionForm'
import { ArchiveTeamButton } from '@/modules/teams/components/ArchiveTeamButton'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  Coreteam: 'Coreteam',
  Project: 'Project',
  Team: 'Team',
}

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const canEdit = session?.user.role === 'Admin' || session?.user.role === 'VP4HR'

  const [team, allMembers] = await Promise.all([
    getTeamById(params.id),
    getMembersForSelect(),
  ])

  if (!team) notFound()

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-1">
        <Link href="/teams" className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
          Команди
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[13px] text-gray-800 font-medium">{team.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6 mt-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">{team.name}</h1>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8EDF8] text-[#0A3D91]">
              {TYPE_LABELS[team.type] ?? team.type}
            </span>
            {team.isArchived && (
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                Архів
              </span>
            )}
          </div>
          {(team.startDate || team.endDate) && (
            <p className="text-[12px] text-gray-400">
              {team.startDate && new Date(team.startDate).toLocaleDateString('uk-UA')}
              {team.endDate && ` — ${new Date(team.endDate).toLocaleDateString('uk-UA')}`}
            </p>
          )}
        </div>

        {canEdit && !team.isArchived && (
          <ArchiveTeamButton teamId={team.id} />
        )}
      </div>

      {canEdit && !team.isArchived && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-4 mb-6">
          <h2 className="text-[13px] font-semibold text-gray-800 mb-3">Додати позицію</h2>
          <AddPositionForm teamId={team.id} isCoreteam={team.type === 'Coreteam'} />
        </div>
      )}

      {team.positions.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[10px] p-12 text-center">
          <p className="text-[13px] font-medium text-gray-600">Немає позицій</p>
          <p className="text-[12px] text-gray-400 mt-1">Додайте першу позицію команди</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {team.positions.map(position => (
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
    </div>
  )
}
