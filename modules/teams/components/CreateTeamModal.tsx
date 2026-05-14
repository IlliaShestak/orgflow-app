'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TeamForm } from './TeamForm'

export function CreateTeamModal() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleSuccess(id: string) {
    setOpen(false)
    router.push(`/teams/${id}`)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-[#E85D04] hover:bg-[#F4845F] text-white rounded-[7px] px-[14px] py-[7px] text-xs font-semibold transition-colors"
      >
        Нова команда
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-[10px] border border-gray-100 shadow-lg p-6 w-full max-w-md">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Нова команда</h3>
        <TeamForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </div>
    </div>
  )
}
