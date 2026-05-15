import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getMemberByUserId, getMembersForMentorSelect } from '@/modules/hr/repository/memberRepository'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { StateBadge } from '@/shared/components/StateBadge'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
import { MemberEditDialog } from '@/modules/hr/components/MemberEditDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { formatDate } from '@/shared/lib/utils'
import { ChangePasswordDialog } from '@/modules/admin/components/ChangePasswordDialog'
import { getKspzTableByStatus } from '@/modules/knowledge/repository/kspzTableRepository'
import { getCoverageForMember } from '@/modules/knowledge/repository/kspzCoverageRepository'
import { MemberKspzGrid } from '@/modules/knowledge/components/MemberKspzGrid'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role === 'Admin') redirect('/information-book')

  const { tab = 'info' } = await searchParams

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

  const tabs = [
    { key: 'info', label: 'Загальна інформація' },
    { key: 'teams', label: 'Команди' },
    { key: 'kspz', label: 'КСПЗ' },
    { key: 'history', label: 'Історія подач' },
  ]

  return (
    <div className="space-y-6">
      {/* Header card */}
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {tabs.map(t => (
          <a
            key={t.key}
            href={`/profile?tab=${t.key}`}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'border-[#E85D04] text-[#E85D04]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {tab === 'info' && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Особисті дані</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoRow label="Email" value={member.email} />
            <InfoRow label="Телефон" value={member.phone} />
            <InfoRow label="Telegram" value={member.telegram} />
            <InfoRow label="Instagram" value={member.instagram} />
            <InfoRow label="Facebook" value={member.facebook} />
            <InfoRow label="Дата народження" value={member.birthDate ? formatDate(member.birthDate) : null} />
            <InfoRow label="Рік навчання" value={member.studyYear?.toString()} />
            <InfoRow label="Дата вступу" value={formatDate(member.joinedAt)} />
            <InfoRow label="Родина" value={member.family} />
          </div>

          {member.mentor && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px] mb-2">Ментор</p>
              <a
                href={`/information-book/${member.mentor.id}`}
                className="inline-flex items-center gap-2 text-[13px] text-gray-700 hover:text-[#0A3D91] transition-colors"
              >
                <MemberAvatar firstName={member.mentor.firstName} lastName={member.mentor.lastName} size="sm" />
                {member.mentor.lastName} {member.mentor.firstName}
              </a>
            </div>
          )}
        </div>
      )}

      {tab === 'teams' && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Команди</h2>
          {member.teamMemberships.length === 0 ? (
            <p className="text-sm text-gray-400">Не є учасником жодної команди</p>
          ) : (
            <div className="space-y-3">
              {member.teamMemberships.map((tm: { id: string; startDate: Date; endDate: Date | null; position: { name: string; team: { name: string; type: string } } }) => (
                <div key={tm.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">{tm.position.team.name} — {tm.position.name}</p>
                    <p className="text-[11px] text-gray-400">{tm.position.team.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-gray-500">{formatDate(tm.startDate)}</p>
                    {tm.endDate ? (
                      <p className="text-[11px] text-gray-400">— {formatDate(tm.endDate)}</p>
                    ) : (
                      <span className="text-[11px] text-[#0B7B45] font-medium">Активний</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'kspz' && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">КСПЗ</h2>
          {!kspzTable ? (
            <p className="text-sm text-gray-400">
              Таблиця знань для статусу {member.status} ще не створена
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 mb-3">
                Таблиця: <span className="font-medium text-gray-600">{kspzTable.name}</span>
              </p>
              <MemberKspzGrid
                memberId={member.id}
                topics={kspzTable.topics}
                coverage={memberCoverage}
                canEdit={canEdit}
              />
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Історія подач</h2>
          {member.applicationHistory.length === 0 ? (
            <p className="text-sm text-gray-400">Немає записів про подачі</p>
          ) : (
            <div className="space-y-3">
              {member.applicationHistory.map((app: { id: string; positionName: string; teamName: string; appliedAt: Date; result: string }) => (
                <div key={app.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">{app.positionName}</p>
                    <p className="text-[11px] text-gray-400">{app.teamName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-gray-500">{formatDate(app.appliedAt)}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      app.result === 'Success' ? 'bg-[#E6F5EE] text-[#0B7B45]' : 'bg-red-50 text-red-500'
                    }`}>
                      {app.result === 'Success' ? 'Успішно' : 'Не пройшов'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px]">{label}</p>
      <p className="text-[13px] text-gray-700 mt-0.5">{value ?? '—'}</p>
    </div>
  )
}
