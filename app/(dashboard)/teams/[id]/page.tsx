import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { getTeamById, getMembersForSelect } from '@/modules/teams/repository/teamRepository'
import { TeamDetailClient } from '@/modules/teams/components/TeamDetailClient'
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

        <TeamDetailClient team={team} allMembers={allMembers} canEdit={canEdit} />
      </div>
    </div>
  )
}
