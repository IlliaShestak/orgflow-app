'use client'

import { useState } from 'react'
import { MemberForm } from './MemberForm'

interface MentorOption {
  id: string
  firstName: string
  lastName: string
}

interface AddMemberDialogProps {
  mentors: MentorOption[]
}

export function AddMemberDialog({ mentors }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-[14px] py-[7px] text-xs font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] transition-colors"
      >
        Додати учасника
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-[10px] border border-gray-100 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-[15px] font-semibold text-gray-900">Новий учасник</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <MemberForm mentors={mentors} onClose={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
