'use client'

import { useState } from 'react'
import { ChangePasswordForm } from './ChangePasswordForm'

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-[#E85D04] hover:text-[#E85D04] rounded-[7px] transition-colors"
      >
        Змінити пароль
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-[10px] border border-gray-100 shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-gray-900">Зміна пароля</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ChangePasswordForm onSuccess={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
