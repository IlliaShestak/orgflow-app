'use client'

import { useState } from 'react'
import { MemberForm } from './MemberForm'

interface MentorOption {
  id: string
  firstName: string
  lastName: string
}

interface MemberData {
  id: string
  firstName: string
  lastName: string
  gender?: string | null
  birthDate?: Date | null
  studyYear?: number | null
  joinedAt: Date
  email?: string | null
  phone?: string | null
  telegram?: string | null
  instagram?: string | null
  facebook?: string | null
  family?: string | null
  status: string
  state: string
  mentorId?: string | null
}

interface MemberEditDialogProps {
  member: MemberData
  mentors: MentorOption[]
  restrictedMode?: boolean
}

export function MemberEditDialog({ member, mentors, restrictedMode = false }: MemberEditDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-[#E85D04] hover:text-[#E85D04] rounded-[7px] transition-colors"
      >
        Редагувати
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-[10px] border border-gray-100 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-[15px] font-semibold text-gray-900">Редагувати учасника</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <MemberForm
                restrictedMode={restrictedMode}
                initialData={{
                  id: member.id,
                  firstName: member.firstName,
                  lastName: member.lastName,
                  gender: member.gender as 'Male' | 'Female' | undefined ?? undefined,
                  birthDate: member.birthDate ?? undefined,
                  studyYear: member.studyYear ?? undefined,
                  joinedAt: member.joinedAt,
                  email: member.email ?? undefined,
                  phone: member.phone ?? undefined,
                  telegram: member.telegram ?? undefined,
                  instagram: member.instagram ?? undefined,
                  facebook: member.facebook ?? undefined,
                  family: member.family ?? undefined,
                  status: member.status as 'Observer' | 'Baby' | 'Full' | 'Alumni',
                  state: member.state as 'Active' | 'Inactive',
                  mentorId: member.mentorId ?? undefined,
                }}
                mentors={mentors}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
