import Link from 'next/link'
import { TeamListItem } from '../types'

const TYPE_LABELS: Record<string, string> = {
  Coreteam: 'Coreteam',
  Project: 'Project',
  Team: 'Team',
}

interface TeamCardProps {
  team: TeamListItem
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.id}`}>
      <div className="bg-white border border-gray-100 rounded-[10px] p-4 hover:shadow-md hover:border-[#E85D04]/30 cursor-pointer transition-all">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8EDF8] text-[#0A3D91]">
            {TYPE_LABELS[team.type] ?? team.type}
          </span>
          {team.isArchived && (
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
              Архів
            </span>
          )}
        </div>
        <h3 className="text-[13px] font-semibold text-gray-800 mb-1">{team.name}</h3>
        <p className="text-[11px] text-gray-400">
          {team._count.positions} позицій
          {team.startDate && (
            <> · з {new Date(team.startDate).toLocaleDateString('uk-UA')}</>
          )}
        </p>
      </div>
    </Link>
  )
}
