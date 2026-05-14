'use client'

import { useState, useTransition } from 'react'
import { createTeam } from '../actions/createTeam'

interface TeamFormProps {
  onSuccess: (id: string) => void
  onCancel: () => void
}

const TEAM_TYPES = [
  { value: 'Coreteam', label: 'Coreteam' },
  { value: 'Project', label: 'Project' },
  { value: 'Team', label: 'Team' },
]

export function TeamForm({ onSuccess, onCancel }: TeamFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createTeam(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.id) {
        onSuccess(result.id)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
          Назва
        </label>
        <input
          name="name"
          required
          placeholder="Назва команди"
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
          Тип
        </label>
        <select
          name="type"
          required
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
        >
          {TEAM_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
            Початок
          </label>
          <input
            name="startDate"
            type="date"
            className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
            Завершення
          </label>
          <input
            name="endDate"
            type="date"
            className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}

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
