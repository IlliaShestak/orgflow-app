'use client'

import { MemberListItem, MemberStatus } from '../types'
import { MemberKanbanCard } from './MemberKanbanCard'

const columns: { status: MemberStatus; label: string; headerClass: string; badgeClass: string }[] = [
  { status: 'Observer', label: 'Observer', headerClass: 'bg-[#E8EDF8] text-[#0A3D91]', badgeClass: 'bg-[#0A3D91] text-white' },
  { status: 'Baby', label: 'Baby', headerClass: 'bg-[#FDF0E8] text-[#E85D04]', badgeClass: 'bg-[#E85D04] text-white' },
  { status: 'Full', label: 'Full', headerClass: 'bg-[#E6F5EE] text-[#0B7B45]', badgeClass: 'bg-[#0B7B45] text-white' },
  { status: 'Alumni', label: 'Alumni', headerClass: 'bg-gray-100 text-gray-500', badgeClass: 'bg-gray-400 text-white' },
]

interface MemberKanbanBoardProps {
  members: MemberListItem[]
}

export function MemberKanbanBoard({ members }: MemberKanbanBoardProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => {
        const colMembers = members.filter(m => m.status === col.status)
        return (
          <div key={col.status} className="flex flex-col gap-2">
            <div className={`flex items-center justify-between px-3 py-2 rounded-[8px] ${col.headerClass}`}>
              <span className="text-[12px] font-semibold">{col.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.badgeClass}`}>
                {colMembers.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {colMembers.map((member, i) => (
                <MemberKanbanCard key={member.id} member={member} colorIndex={i % 3} />
              ))}
              {colMembers.length === 0 && (
                <div className="text-center py-6 text-[11px] text-gray-300">Немає учасників</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
