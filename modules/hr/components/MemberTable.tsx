'use client'

import Link from 'next/link'
import { MemberListItem } from '../types'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { StateBadge } from '@/shared/components/StateBadge'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
import { formatDate } from '@/shared/lib/utils'

interface MemberTableProps {
  members: MemberListItem[]
}

export function MemberTable({ members }: MemberTableProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F7F8FA] border-b border-gray-100">
            <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">Учасник</th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">Статус</th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">Стан</th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">Ментор</th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">Вступ</th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">Контакт</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, i) => (
            <tr key={member.id} className="border-b border-gray-100 hover:bg-[#FAFBFD] transition-colors last:border-0">
              <td className="px-4 py-3">
                <Link href={`/information-book/${member.id}`} className="flex items-center gap-2.5 group">
                  <MemberAvatar
                    firstName={member.firstName}
                    lastName={member.lastName}
                    size="sm"
                    colorIndex={i % 3}
                  />
                  <span className="text-[13px] font-medium text-gray-800 group-hover:text-[#0A3D91] transition-colors">
                    {member.lastName} {member.firstName}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={member.status} />
              </td>
              <td className="px-4 py-3">
                <StateBadge state={member.state} />
              </td>
              <td className="px-4 py-3">
                {member.mentor ? (
                  <span className="text-[13px] text-gray-600">
                    {member.mentor.lastName} {member.mentor.firstName}
                  </span>
                ) : (
                  <span className="text-[12px] text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-[13px] text-gray-500">{formatDate(member.joinedAt)}</span>
              </td>
              <td className="px-4 py-3">
                {member.telegram ? (
                  <span className="text-[12px] text-gray-500">{member.telegram}</span>
                ) : member.email ? (
                  <span className="text-[12px] text-gray-500">{member.email}</span>
                ) : (
                  <span className="text-[12px] text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
