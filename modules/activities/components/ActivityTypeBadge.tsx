'use client'

import { ActivityType } from '@prisma/client'

const labels: Record<ActivityType, string> = {
  Gathering: 'Gathering',
  SIT: 'SIT',
  LeisureEvent: 'Leisure Event',
  ThursdayMeeting: 'Четвергові збори',
}

const styles: Record<ActivityType, string> = {
  Gathering: 'bg-[#E8EDF8] text-[#0A3D91]',
  SIT: 'bg-[#FDF0E8] text-[#E85D04]',
  LeisureEvent: 'bg-[#E6F5EE] text-[#0B7B45]',
  ThursdayMeeting: 'bg-gray-100 text-gray-600',
}

export function ActivityTypeBadge({ type }: { type: ActivityType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[5px] text-[11px] font-semibold ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}
