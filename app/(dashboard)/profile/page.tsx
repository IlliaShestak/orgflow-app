import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getMemberByUserId, getMembersForMentorSelect } from '@/modules/hr/repository/memberRepository'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { StateBadge } from '@/shared/components/StateBadge'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
import { MemberEditDialog } from '@/modules/hr/components/MemberEditDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ChangePasswordDialog } from '@/modules/admin/components/ChangePasswordDialog'
import { getKspzTableByStatus } from '@/modules/knowledge/repository/kspzTableRepository'
import { getCoverageForMember } from '@/modules/knowledge/repository/kspzCoverageRepository'
import { ProfileTabsClient } from '@/modules/hr/components/ProfileTabsClient'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role === 'Admin') redirect('/information-book')

  const [member, mentors] = await Promise.all([
    getMemberByUserId(session.user.id),
    getMembersForMentorSelect(),
  ])

  if (!member) {
    return (
      <EmptyState
        title="Профіль не знайдено"
        description="Ваш обліковий запис ще не прив'язаний до учасника. Зверніться до адміністратора."
      />
    )
  }

  const [kspzTable, memberCoverage] = await Promise.all([
    getKspzTableByStatus(member.status),
    getKspzTableByStatus(member.status).then((t) =>
      t ? getCoverageForMember(member.id, t.id) : []
    ),
  ])

  const role = session.user.role
  const canEdit = role === 'VP4HR'

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-[10px] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <MemberAvatar firstName={member.firstName} lastName={member.lastName} size="lg" colorIndex={1} />
            <div>
              <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">
                {member.lastName} {member.firstName}
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <StatusBadge status={member.status} />
                <StateBadge state={member.state} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChangePasswordDialog />
            <MemberEditDialog member={member} mentors={mentors} restrictedMode={role === 'FullMember'} />
          </div>
        </div>
      </div>

      <ProfileTabsClient
        member={member}
        kspzTable={kspzTable}
        memberCoverage={memberCoverage}
        canEdit={canEdit}
      />
    </div>
  )
}
