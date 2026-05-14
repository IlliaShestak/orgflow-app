'use client'

import { useTransition } from 'react'
import { archiveTeam } from '../actions/updateTeam'

interface ArchiveTeamButtonProps {
  teamId: string
}

export function ArchiveTeamButton({ teamId }: ArchiveTeamButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await archiveTeam(teamId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-gray-300 transition-colors disabled:opacity-50"
    >
      {isPending ? 'Архівування...' : 'Архівувати'}
    </button>
  )
}
