import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { getMemberById, getMembersForMentorSelect } from '@/modules/hr/repository/memberRepository'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { StateBadge } from '@/shared/components/StateBadge'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
import { MemberEditDialog } from '@/modules/hr/components/MemberEditDialog'
import { formatDate } from '@/shared/lib/utils'
import { getKspzTableByStatus } from '@/modules/knowledge/repository/kspzTableRepository'
import { getCoverageForMember } from '@/modules/knowledge/repository/kspzCoverageRepository'
import { MemberKspzGrid } from '@/modules/knowledge/components/MemberKspzGrid'

type MemberFull = NonNullable<Awaited<ReturnType<typeof getMemberById>>>
type Mentee = MemberFull['mentees'][number]
type TeamMembership = MemberFull['teamMemberships'][number]
type AppHistory = MemberFull['applicationHistory'][number]

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function MemberProfilePage({ params, searchParams }: PageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params
  const { tab = 'info' } = await searchParams

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
                    Ментор: {member.mentor.lastName} {member.mentor.firstName}
                  </span>
                )}
              </div>
            </div>
          </div>
          {canEdit && <MemberEditDialog member={member} mentors={mentors} />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {tabs.map(t => (
          <a
            key={t.key}
            href={`/information-book/${id}?tab=${t.key}`}
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

      {/* Tab content */}
      {tab === 'info' && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Особисті дані</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoRow label="Email" value={member.email} />
            <InfoRow label="Телефон" value={member.phone} />
            <InfoRow label="Telegram" value={member.telegram} />
            <InfoRow label="Instagram" value={member.instagram} />
            <InfoRow label="Facebook" value={member.facebook} />
            <InfoRow label="Стать" value={member.gender === 'Male' ? 'Чоловіча' : member.gender === 'Female' ? 'Жіноча' : null} />
            <InfoRow label="Дата народження" value={member.birthDate ? formatDate(member.birthDate) : null} />
            <InfoRow label="Рік навчання" value={member.studyYear?.toString()} />
            <InfoRow label="Дата вступу" value={formatDate(member.joinedAt)} />
            <InfoRow label="Родина" value={member.family} />
          </div>
          {member.mentees.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Менті</h3>
              <div className="flex flex-wrap gap-2">
                {member.mentees.map((m: Mentee) => (
                  <a
                    key={m.id}
                    href={`/information-book/${m.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8FA] hover:bg-[#E8EDF8] rounded-full text-[12px] text-gray-700 transition-colors"
                  >
                    <MemberAvatar firstName={m.firstName} lastName={m.lastName} size="sm" />
                    {m.lastName} {m.firstName}
                  </a>
                ))}
              </div>
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
              {member.teamMemberships.map((tm: TeamMembership) => (
                <div key={tm.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">
                      {tm.position.team.name} — {tm.position.name}
                    </p>
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
                memberId={id}
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
              {member.applicationHistory.map((app: AppHistory) => (
                <div key={app.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">{app.positionName}</p>
                    <p className="text-[11px] text-gray-400">{app.teamName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-gray-500">{formatDate(app.appliedAt)}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      app.result === 'Success'
                        ? 'bg-[#E6F5EE] text-[#0B7B45]'
                        : 'bg-red-50 text-red-500'
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
