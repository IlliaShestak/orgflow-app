'use client'

import { useState, useTransition } from 'react'
import { createPosition } from '../actions/managePositions'

interface AddPositionFormProps {
  teamId: string
  isCoreteam: boolean
}

export function AddPositionForm({ teamId, isCoreteam }: AddPositionFormProps) {
  const [name, setName] = useState('')
  const [isHelper, setIsHelper] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const formData = new FormData()
    formData.set('teamId', teamId)
    formData.set('name', name)
    formData.set('isHelper', String(isHelper))
    startTransition(async () => {
      const result = await createPosition(formData)
      if (result?.error) setError(result.error)
      else { setName(''); setIsHelper(false) }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-[10px] text-gray-400 mb-1">Назва позиції</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Наприклад: HR Менеджер"
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors"
        />
        {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      </div>
      {isCoreteam && (
        <label className="flex items-center gap-1.5 text-[12px] text-gray-600 cursor-pointer pb-2">
          <input
            type="checkbox"
            checked={isHelper}
            onChange={e => setIsHelper(e.target.checked)}
            className="rounded"
          />
          Helper
        </label>
      )}
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="bg-[#E85D04] hover:bg-[#F4845F] text-white rounded-[7px] px-[14px] py-[7px] text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {isPending ? '...' : 'Додати позицію'}
      </button>
    </form>
  )
}
