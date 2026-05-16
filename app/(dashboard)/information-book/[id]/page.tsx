import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { getMemberById, getMembersForMentorSelect } from '@/modules/hr/repository/memberRepository'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { StateBadge } from '@/shared/components/StateBadge'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
import { MemberEditDialog } from '@/modules/hr/components/MemberEditDialog'
import { getKspzTableByStatus } from '@/modules/knowledge/repository/kspzTableRepository'
import { getCoverageForMember } from '@/modules/knowledge/repository/kspzCoverageRepository'
import { MemberProfileTabsClient } from '@/modules/hr/components/MemberProfileTabsClient'
import { DeleteMemberButton } from '@/modules/hr/components/DeleteMemberButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MemberProfilePage({ params }: PageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params

  const [member, mentors] = await Promise.all([
    getMemberById(id),
    getMembersForMentorSelect(),
  ])

  if (!member) notFound()

  const [kspzTable, memberCoverage] = await Promise.all([
    getKspzTableByStatus(member.status),
    getKspzTableByStatus(member.status).then((t) =>
      t ? getCoverageForMember(id, t.id) : []
    ),
  ])

  const role = session.user.role
  const canEdit = role === 'Admin' || role === 'VP4HR'

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-[10px] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <MemberAvatar firstName={member.firstName} lastName={member.lastName} size="lg" />
            <div>
              <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">
                {member.lastName} {member.firstName}
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <StatusBadge status={member.status} />
                <StateBadge state={member.state} />
                {member.mentor && (
                  <span className="text-[12px] text-gray-400">
                    {'Ментор:'} {member.mentor.lastName} {member.mentor.firstName}
                  </span>
                )}
              </div>
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <DeleteMemberButton memberId={member.id} />
              <MemberEditDialog member={member} mentors={mentors} />
            </div>
          )}
        </div>
      </div>

      <MemberProfileTabsClient
        member={member}
        kspzTable={kspzTable}
        memberCoverage={memberCoverage}
        canEdit={canEdit}
      />
    </div>
  )
}
