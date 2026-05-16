'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
import { MemberKspzGrid } from '@/modules/knowledge/components/MemberKspzGrid'
import type { KspzTopic } from '@/modules/knowledge/types'

type DateLike = Date | string | null | undefined

type Mentee = { id: string; firstName: string; lastName: string }

type TeamMembership = {
  id: string
  startDate: DateLike
  endDate: DateLike
  position: { name: string; team: { name: string; type: string } }
}

type AppHistory = {
  id: string
  positionName: string
  teamName: string
  appliedAt: DateLike
  result: string
}

interface MemberProfileTabsClientProps {
  member: {
    id: string
    email: string | null
    phone: string | null
    telegram: string | null
    instagram: string | null
    facebook: string | null
    gender: string | null
    birthDate: DateLike
    studyYear: number | null
    joinedAt: DateLike
    family: string | null
    status: string
    mentees: Mentee[]
    teamMemberships: TeamMembership[]
    applicationHistory: AppHistory[]
  }
  kspzTable: { id: string; name: string; topics: KspzTopic[] } | null
  memberCoverage: { knowledgeTopicId: string; coveredAt: Date | null }[]
  canEdit: boolean
}

const TABS = [
  { key: 'info', label: 'Загальна інформація' },
  { key: 'teams', label: 'Команди' },
  { key: 'kspz', label: 'КСПЗ' },
  { key: 'history', label: 'Історія подач' },
] as const

type TabKey = (typeof TABS)[number]['key']

function fmt(date: DateLike): string {
  if (!date) return '—'
  return new Date(date as string).toLocaleDateString('uk-UA')
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px]">{label}</p>
      <p className="text-[13px] text-gray-700 mt-0.5">{value ?? '—'}</p>
    </div>
  )
}

export function MemberProfileTabsClient({
  member,
  kspzTable,
  memberCoverage,
  canEdit,
}: MemberProfileTabsClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('info')

  const genderLabel =
    member.gender === 'Male' ? 'Чоловіча' : member.gender === 'Female' ? 'Жіноча' : null

  return (
    <>
      <div className="flex gap-1 border-b border-gray-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={[
              'px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px',
              activeTab === t.key
                ? 'border-[#E85D04] text-[#E85D04]'
                : 'border-transparent text-gray-500 hover:text-gray-800',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">{'Особисті дані'}</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoRow label="Email" value={member.email} />
            <InfoRow label="Телефон" value={member.phone} />
            <InfoRow label="Telegram" value={member.telegram} />
            <InfoRow label="Instagram" value={member.instagram} />
            <InfoRow label="Facebook" value={member.facebook} />
            <InfoRow label="Стать" value={genderLabel} />
            <InfoRow label="Дата народження" value={member.birthDate ? fmt(member.birthDate) : null} />
            <InfoRow label="Рік навчання" value={member.studyYear?.toString()} />
            <InfoRow label="Дата вступу" value={fmt(member.joinedAt)} />
            <InfoRow label="Родина" value={member.family} />
          </div>
          {member.mentees.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{'Менті'}</h3>
              <div className="flex flex-wrap gap-2">
                {member.mentees.map((m) => (
                  <Link
                    key={m.id}
                    href={`/information-book/${m.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8FA] hover:bg-[#E8EDF8] rounded-full text-[12px] text-gray-700 transition-colors"
                  >
                    <MemberAvatar firstName={m.firstName} lastName={m.lastName} size="sm" />
                    {m.lastName} {m.firstName}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">{'Команди'}</h2>
          {member.teamMemberships.length === 0 ? (
            <p className="text-sm text-gray-400">{'Не є учасником жодної команди'}</p>
          ) : (
            <div className="space-y-3">
              {member.teamMemberships.map((tm) => (
                <div
                  key={tm.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">
                      {tm.position.team.name} — {tm.position.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{tm.position.team.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-gray-500">{fmt(tm.startDate)}</p>
                    {tm.endDate ? (
                      <p className="text-[11px] text-gray-400">— {fmt(tm.endDate)}</p>
                    ) : (
                      <span className="text-[11px] text-[#0B7B45] font-medium">{'Активний'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'kspz' && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">{'КСПЗ'}</h2>
          {!kspzTable ? (
            <p className="text-sm text-gray-400">
              {'Таблиця знань для статусу'} {member.status} {'ще не створена'}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 mb-3">
                {'Таблиця:'}{' '}
                <span className="font-medium text-gray-600">{kspzTable.name}</span>
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

      {activeTab === 'history' && (
        <div className="bg-white border border-gray-100 rounded-[10px] p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">{'Історія подач'}</h2>
          {member.applicationHistory.length === 0 ? (
            <p className="text-sm text-gray-400">{'Немає записів про подачі'}</p>
          ) : (
            <div className="space-y-3">
              {member.applicationHistory.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">{app.positionName}</p>
                    <p className="text-[11px] text-gray-400">{app.teamName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-gray-500">{fmt(app.appliedAt)}</span>
                    <span
                      className={[
                        'text-[11px] font-medium px-2 py-0.5 rounded-full',
                        app.result === 'Success'
                          ? 'bg-[#E6F5EE] text-[#0B7B45]'
                          : 'bg-red-50 text-red-500',
                      ].join(' ')}
                    >
                      {app.result === 'Success' ? 'Успішно' : 'Не пройшов'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
