'use client'

import { useState, useTransition } from 'react'
import { createUser } from '../actions/createUser'
import { MemberForSelect } from '../types'

interface UserFormProps {
  members: MemberForSelect[]
  onSuccess: () => void
  onCancel: () => void
}

const ROLES = [
  { value: 'Admin', label: 'Admin' },
  { value: 'VP4HR', label: 'VP4HR' },
  { value: 'FullMember', label: 'Full Member' },
]

export function UserForm({ members, onSuccess, onCancel }: UserFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createUser(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="email@example.com"
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
          Роль
        </label>
        <select
          name="role"
          required
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
        >
          {ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
          Прив&apos;язати до учасника (необов&apos;язково)
        </label>
        <select
          name="memberId"
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
        >
          <option value="">— без прив&apos;язки —</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.lastName} {m.firstName}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-[12px] text-red-500">{error}</p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-gray-300 transition-colors"
        >
          Скасувати
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] transition-colors disabled:opacity-50"
        >
          {isPending ? 'Збереження...' : 'Створити'}
        </button>
      </div>
    </form>
  )
}
