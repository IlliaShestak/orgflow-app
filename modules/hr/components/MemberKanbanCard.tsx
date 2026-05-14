'use client'

import Link from 'next/link'
import { MemberListItem } from '../types'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
import { StateBadge } from '@/shared/components/StateBadge'

interface MemberKanbanCardProps {
  member: MemberListItem
  colorIndex: number
}

export function MemberKanbanCard({ member, colorIndex }: MemberKanbanCardProps) {
  return (
    <Link href={`/information-book/${member.id}`}>
      <div className="bg-white border border-gray-200 rounded-[8px] p-3 hover:shadow-md hover:border-[#E85D04] cursor-pointer transition-all">
        <div className="flex items-center gap-2 mb-2">
          <MemberAvatar firstName={member.firstName} lastName={member.lastName} size="sm" colorIndex={colorIndex} />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-800 truncate">
              {member.lastName} {member.firstName}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <StateBadge state={member.state} />
          {member.mentor && (
            <span className="text-[11px] text-gray-400 truncate ml-1">
              {member.mentor.lastName} {member.mentor.firstName[0]}.
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
