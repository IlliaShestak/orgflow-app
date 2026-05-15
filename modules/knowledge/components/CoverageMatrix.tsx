'use client'

import { useTransition } from 'react'
import { toggleKspzCoverage } from '../actions/kspzActions'
import type { KspzTopic } from '../types'

interface CoverageRecord {
  memberId: string
  knowledgeTopicId: string
  coveredAt: Date | null
}

interface MemberRow {
  id: string
  firstName: string
  lastName: string
}

interface CoverageMatrixProps {
  topics: KspzTopic[]
  members: MemberRow[]
  coverage: CoverageRecord[]
  canEdit: boolean
}

export function CoverageMatrix({ topics, members, coverage, canEdit }: CoverageMatrixProps) {
  const [isPending, startTransition] = useTransition()

  const coverageSet = new Set(coverage.map((c) => `${c.memberId}:${c.knowledgeTopicId}`))

  function isCovered(memberId: string, topicId: string) {
    return coverageSet.has(`${memberId}:${topicId}`)
  }

  function handleToggle(memberId: string, topicId: string, currentlyCovered: boolean) {
    if (!canEdit) return
    startTransition(async () => {
      await toggleKspzCoverage({ memberId, knowledgeTopicId: topicId, covered: !currentlyCovered })
    })
  }

  if (members.length === 0 || topics.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-8">
        {members.length === 0 ? 'Учасників немає' : 'Тем немає'}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-[#F7F8FA] border-b border-gray-100">
            <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400 sticky left-0 bg-[#F7F8FA] z-10 min-w-[160px]">
              Учасник
            </th>
            {topics.map((topic) => (
              <th
                key={topic.id}
                className="px-2 py-2 text-center text-[10px] font-semibold text-gray-600 border-l border-gray-200 min-w-[80px]"
              >
                {topic.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-gray-100 hover:bg-[#FAFBFD]">
              <td className="px-3 py-2 sticky left-0 bg-white z-10 border-r border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#E85D04] flex items-center justify-center text-white text-[9px] font-semibold shrink-0">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <span className="text-gray-800 font-medium">
                    {member.lastName} {member.firstName}
                  </span>
                </div>
              </td>
              {topics.map((topic) => {
                const covered = isCovered(member.id, topic.id)
                return (
                  <td key={topic.id} className="text-center border-l border-gray-100 px-2 py-2">
                    <button
                      onClick={() => handleToggle(member.id, topic.id, covered)}
                      disabled={!canEdit || isPending}
                      className={`w-5 h-5 rounded-[3px] flex items-center justify-center mx-auto transition-colors ${
                        covered
                          ? 'bg-[#3CB371] text-white'
                          : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                      } ${!canEdit ? 'cursor-default' : 'cursor-pointer'}`}
                      title={covered ? 'Покрито' : 'Не покрито'}
                    >
                      {covered && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
  )
}
