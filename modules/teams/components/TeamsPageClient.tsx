'use client'

import { useState } from 'react'
import { TeamCard } from './TeamCard'
import { TeamListItem } from '../types'

interface TeamsPageClientProps {
  teams: TeamListItem[]
  canEdit: boolean
  createButton: React.ReactNode
}

const TABS = [
  { key: 'Coreteam', label: 'Coreteams' },
  { key: 'Project', label: 'Projects' },
  { key: 'Team', label: 'Teams' },
  { key: 'archived', label: 'Архів' },
] as const

type TabKey = (typeof TABS)[number]['key']

const ARCHIVE_GROUPS: { type: 'Coreteam' | 'Project' | 'Team'; label: string }[] = [
  { type: 'Coreteam', label: 'Coreteams' },
  { type: 'Project', label: 'Projects' },
  { type: 'Team', label: 'Teams' },
]

function ArchivedTeamsGroups({ teams }: { teams: TeamListItem[] }) {
  const groups = ARCHIVE_GROUPS.map((g) => ({
    ...g,
    items: teams.filter((t) => t.type === g.type),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.type}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.8px]">
              {group.label}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {group.items.length}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TeamsPageClient({ teams, canEdit, createButton }: TeamsPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('Coreteam')
  const [searchQuery, setSearchQuery] = useState('')

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab)
    setSearchQuery('')
  }

  const active = teams.filter((t) => !t.isArchived)
  const archived = teams.filter((t) => t.isArchived)

  const counts: Record<TabKey, number> = {
    Coreteam: active.filter((t) => t.type === 'Coreteam').length,
    Project: active.filter((t) => t.type === 'Project').length,
    Team: active.filter((t) => t.type === 'Team').length,
    archived: archived.length,
  }

  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '')

  const base = activeTab === 'archived' ? archived : active.filter((t) => t.type === activeTab)
  const displayed = searchQuery.trim()
    ? base.filter((t) => normalize(t.name).includes(normalize(searchQuery)))
    : base

  const emptyMessages: Record<TabKey, string> = {
    Coreteam: 'Немає активних Coreteam',
    Project: 'Немає активних Projects',
    Team: 'Немає активних Teams',
    archived: 'Немає архівованих команд',
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">{'Команди'}</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{active.length} активних команд</p>
        </div>
        {canEdit && createButton}
      </div>

      <div className="flex items-center justify-between border-b border-gray-100 mb-6">
        <div className="flex items-center gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={[
              'flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium transition-colors -mb-px',
              activeTab === tab.key
                ? 'text-gray-900 border-b-2 border-[#E85D04]'
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent',
            ].join(' ')}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={[
                  'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                  activeTab === tab.key ? 'bg-[#FDF0E8] text-[#E85D04]' : 'bg-gray-100 text-gray-400',
                ].join(' ')}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
        </div>
        <div className="relative mb-px">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за назвою..."
            className="h-10 w-[480px] bg-white border-2 border-gray-300 rounded-[9px] pl-9 pr-4 text-[14px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors"
          />
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[10px] p-12 text-center">
          <p className="text-[13px] font-medium text-gray-500">
            {searchQuery.trim() ? `Команд за запитом «${searchQuery}» не знайдено` : emptyMessages[activeTab]}
          </p>
          {!searchQuery.trim() && canEdit && activeTab !== 'archived' && (
            <p className="text-[12px] text-gray-400 mt-1">
              {'Натисніть «Створити команду», щоб додати'}
            </p>
          )}
        </div>
      ) : activeTab === 'archived' ? (
        <ArchivedTeamsGroups teams={displayed} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </>
  )
}
