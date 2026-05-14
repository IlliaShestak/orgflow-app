import { auth } from '@/auth'
import { getTeams } from '@/modules/teams/repository/teamRepository'
import { TeamCard } from '@/modules/teams/components/TeamCard'
import { CreateTeamModal } from '@/modules/teams/components/CreateTeamModal'
import { EmptyState } from '@/shared/components/EmptyState'

export default async function TeamsPage() {
  const session = await auth()
  const canEdit = session?.user.role === 'Admin' || session?.user.role === 'VP4HR'

  const teams = await getTeams()
  const active = teams.filter(t => !t.isArchived)
  const archived = teams.filter(t => t.isArchived)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">Команди</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{active.length} активних команд</p>
        </div>
        {canEdit && <CreateTeamModal />}
      </div>

      {active.length === 0 && archived.length === 0 ? (
        <EmptyState
          title="Немає команд"
          description="Створіть першу команду організації"
          action={canEdit ? <CreateTeamModal /> : undefined}
        />
      ) : (
        <>
          {active.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {active.map(team => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}

          {archived.length > 0 && (
            <div>
              <h2 className="text-[11px] font-semibold tracking-[1.2px] uppercase text-gray-400 mb-3">
                Історія
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archived.map(team => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
