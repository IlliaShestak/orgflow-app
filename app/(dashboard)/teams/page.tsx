import { auth } from '@/auth'
import { getTeams } from '@/modules/teams/repository/teamRepository'
import { TeamsPageClient } from '@/modules/teams/components/TeamsPageClient'
import { CreateTeamModal } from '@/modules/teams/components/CreateTeamModal'

export default async function TeamsPage() {
  const session = await auth()
  const canEdit = session?.user.role === 'Admin' || session?.user.role === 'VP4HR'

  const teams = await getTeams()

  return (
    <div className="p-8">
      <TeamsPageClient
        teams={teams}
        canEdit={canEdit}
        createButton={<CreateTeamModal />}
      />
    </div>
  )
}
