'use client'

import { useTransition } from 'react'
import { toggleKspzCoverage } from '../actions/kspzActions'
import type { KspzTopic } from '../types'

interface CoverageRecord {
  knowledgeTopicId: string
  coveredAt: Date | null
}

interface MemberKspzGridProps {
  memberId: string
  topics: KspzTopic[]
  coverage: CoverageRecord[]
  canEdit: boolean
}

export function MemberKspzGrid({ memberId, topics, coverage, canEdit }: MemberKspzGridProps) {
  const [isPending, startTransition] = useTransition()

  const coveredTopicIds = new Set(coverage.map((c) => c.knowledgeTopicId))

  function handleToggle(topicId: string, currentlyCovered: boolean) {
    if (!canEdit) return
    startTransition(async () => {
      await toggleKspzCoverage({ memberId, knowledgeTopicId: topicId, covered: !currentlyCovered })
    })
  }

  const coveredCount = topics.filter((t) => coveredTopicIds.has(t.id)).length
  const pct = topics.length > 0 ? Math.round((coveredCount / topics.length) * 100) : 0

  if (topics.length === 0) {
    return <p className="text-xs text-gray-400">Теми ще не додані до таблиці</p>
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-100 rounded-[2px] h-[5px]">
          <div className="bg-[#3CB371] rounded-[2px] h-[5px] transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[11px] text-gray-400 shrink-0">{pct}% покрито</span>
      </div>

      {/* Topic list */}
      <div className="space-y-1">
        {topics.map((topic, i) => {
          const covered = coveredTopicIds.has(topic.id)
          return (
            <div key={topic.id} className="flex items-center gap-3 px-3 py-2 bg-[#F7F8FA] rounded-[8px]">
              <span className="text-[11px] text-gray-400 w-5 shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm text-gray-800 min-w-0">{topic.name}</span>
              <button
                onClick={() => handleToggle(topic.id, covered)}
                disabled={!canEdit || isPending}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-medium transition-colors shrink-0 ${
                  covered
                    ? 'bg-[#3CB371] text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                } ${!canEdit ? 'cursor-default' : 'cursor-pointer'} disabled:opacity-60`}
              >
                {covered && (
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="shrink-0">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {covered ? 'Покрито' : 'Не покрито'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
