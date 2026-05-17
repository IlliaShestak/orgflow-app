'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createApplicationHistory, updateApplicationHistory, deleteApplicationHistory } from '../actions/memberActions'
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

type FormData = { positionName: string; teamName: string; appliedAt: string; result: 'Success' | 'Fail' }

function toDateInput(date: DateLike): string {
  if (!date) return new Date().toISOString().split('T')[0]
  const d = new Date(date as string)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function AppHistoryForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: AppHistory
  onSave: (data: FormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [positionName, setPositionName] = useState(initial?.positionName ?? '')
  const [teamName, setTeamName] = useState(initial?.teamName ?? '')
  const [appliedAt, setAppliedAt] = useState(toDateInput(initial?.appliedAt))
  const [result, setResult] = useState<'Success' | 'Fail'>(
    (initial?.result as 'Success' | 'Fail') ?? 'Success'
  )

  const canSubmit = positionName.trim() && teamName.trim() && appliedAt

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSave({ positionName: positionName.trim(), teamName: teamName.trim(), appliedAt, result })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAFBFD] border border-gray-100 rounded-[8px] p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] text-gray-400">{'Позиція'}</label>
          <input
            value={positionName}
            onChange={(e) => setPositionName(e.target.value)}
            placeholder="Назва позиції"
            required
            className="w-full border border-gray-200 rounded-[7px] px-2.5 py-1.5 text-[12px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] text-gray-400">{'Команда'}</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Назва команди"
            required
            className="w-full border border-gray-200 rounded-[7px] px-2.5 py-1.5 text-[12px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
          />
        </div>
      </div>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <label className="block text-[10px] text-gray-400">{'Дата подачі'}</label>
          <input
            type="date"
            value={appliedAt}
            onChange={(e) => setAppliedAt(e.target.value)}
            required
            className="border border-gray-200 rounded-[7px] px-2.5 py-1.5 text-[12px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] text-gray-400">{'Результат'}</label>
          <div className="flex rounded-[7px] overflow-hidden border border-gray-200">
            <button
              type="button"
              onClick={() => setResult('Success')}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${
                result === 'Success' ? 'bg-[#E6F5EE] text-[#0B7B45]' : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              {'Успішно'}
            </button>
            <button
              type="button"
              onClick={() => setResult('Fail')}
              className={`px-3 py-1.5 text-[11px] font-medium border-l border-gray-200 transition-colors ${
                result === 'Fail' ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              {'Не пройшов'}
            </button>
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-[7px] hover:bg-gray-50 transition-colors"
          >
            {'Скасувати'}
          </button>
          <button
            type="submit"
            disabled={isPending || !canSubmit}
            className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </div>
    </form>
  )
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
  canManageHistory: boolean
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
  canManageHistory,
}: MemberProfileTabsClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('info')
  const [records, setRecords] = useState<AppHistory[]>(member.applicationHistory)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd(data: FormData) {
    setHistoryError(null)
    startTransition(async () => {
      const res = await createApplicationHistory({
        memberId: member.id,
        positionName: data.positionName,
        teamName: data.teamName,
        appliedAt: new Date(data.appliedAt),
        result: data.result,
      })
      if (!res.success) { setHistoryError(res.error ?? 'Помилка'); return }
      if (res.data) setRecords((prev) => [...prev, res.data!])
      setAdding(false)
    })
  }

  function handleEdit(id: string, data: FormData) {
    setHistoryError(null)
    startTransition(async () => {
      const res = await updateApplicationHistory({
        id,
        memberId: member.id,
        positionName: data.positionName,
        teamName: data.teamName,
        appliedAt: new Date(data.appliedAt),
        result: data.result,
      })
      if (!res.success) { setHistoryError(res.error ?? 'Помилка'); return }
      if (res.data) setRecords((prev) => prev.map((r) => r.id === id ? res.data! : r))
      setEditingId(null)
    })
  }

  function handleDelete(id: string) {
    setHistoryError(null)
    startTransition(async () => {
      const res = await deleteApplicationHistory(id, member.id)
      if (!res.success) { setHistoryError(res.error ?? 'Помилка'); return }
      setRecords((prev) => prev.filter((r) => r.id !== id))
    })
  }

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">{'Історія подач'}</h2>
            {canManageHistory && !adding && (
              <button
                onClick={() => { setAdding(true); setEditingId(null) }}
                className="px-3 py-1.5 text-[11px] font-medium text-[#E85D04] border border-[#E85D04] rounded-[7px] hover:bg-[#FDF0E8] transition-colors"
              >
                {'+ Додати запис'}
              </button>
            )}
          </div>

          {adding && (
            <div className="mb-4">
              <AppHistoryForm
                onSave={handleAdd}
                onCancel={() => setAdding(false)}
                isPending={isPending}
              />
            </div>
          )}

          {historyError && <p className="text-xs text-red-500 mb-3">{historyError}</p>}

          {records.length === 0 && !adding ? (
            <p className="text-sm text-gray-400">{'Немає записів про подачі'}</p>
          ) : (
            <div className="space-y-1">
              {records.map((app) => (
                <div key={app.id}>
                  {editingId === app.id ? (
                    <div className="py-1">
                      <AppHistoryForm
                        initial={app}
                        onSave={(data) => handleEdit(app.id, data)}
                        onCancel={() => setEditingId(null)}
                        isPending={isPending}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
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
                        {canManageHistory && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingId(app.id); setAdding(false) }}
                              disabled={isPending}
                              className="text-[11px] text-gray-400 hover:text-[#E85D04] transition-colors disabled:opacity-50"
                            >
                              {'Ред.'}
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              disabled={isPending}
                              className="text-[11px] text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              {'Видалити'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
