'use client'

import { useTransition } from 'react'
import { toggleKspzCoverage } from '../actions/kspzActions'
import type { KspzTopic, KspzTableColumn } from '../types'

interface CoverageRecord {
  knowledgeTopicId: string
  knowledgeTransferTypeId: string
  coveredAt: Date | null
}

interface MemberKspzGridProps {
  memberId: string
  topics: KspzTopic[]
  columns: KspzTableColumn[]
  coverage: CoverageRecord[]
  canEdit: boolean
}

export function MemberKspzGrid({ memberId, topics, columns, coverage, canEdit }: MemberKspzGridProps) {
  const [isPending, startTransition] = useTransition()

  const coverageSet = new Set(
    coverage.map((c) => `${c.knowledgeTopicId}:${c.knowledgeTransferTypeId}`)
  )

  function isCovered(topicId: string, transferTypeId: string) {
    return coverageSet.has(`${topicId}:${transferTypeId}`)
  }

  function handleToggle(topicId: string, transferTypeId: string, currentlyCovered: boolean) {
    if (!canEdit) return
    startTransition(async () => {
      await toggleKspzCoverage({
        memberId,
        knowledgeTopicId: topicId,
        knowledgeTransferTypeId: transferTypeId,
        covered: !currentlyCovered,
      })
    })
  }

  const totalCells = topics.length * columns.length
  const coveredCount = coverage.length
  const pct = totalCells > 0 ? Math.round((coveredCount / totalCells) * 100) : 0

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

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-[#F7F8FA]">
              <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400 min-w-[180px]">
                Тема
              </th>
              {columns.map((col) => (
                <th
                  key={col.knowledgeTransferTypeId}
                  className="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 tracking-[0.8px] uppercase min-w-[80px]"
                >
                  {col.knowledgeTransferType.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id} className="border-t border-gray-100 hover:bg-[#FAFBFD]">
                <td className="px-3 py-2 text-sm text-gray-800">{topic.name}</td>
                {columns.map((col) => {
                  const covered = isCovered(topic.id, col.knowledgeTransferTypeId)
                  return (
                    <td key={col.knowledgeTransferTypeId} className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleToggle(topic.id, col.knowledgeTransferTypeId, covered)}
                        disabled={!canEdit || isPending}
                        className={`w-6 h-6 rounded-[4px] flex items-center justify-center mx-auto transition-colors ${
                          covered
                            ? 'bg-[#3CB371] text-white'
                            : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                        } ${!canEdit ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {covered && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
