'use client'

import { useState, useTransition } from 'react'
import { createTransferType } from '../actions/createTransferType'

export function AddTransferTypeForm() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const formData = new FormData()
    formData.set('name', name)
    startTransition(async () => {
      const result = await createTransferType(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setName('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <div className="flex-1">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Назва типу передачі знань"
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors"
        />
        {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="bg-[#E85D04] hover:bg-[#F4845F] text-white rounded-[7px] px-[14px] py-[7px] text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {isPending ? 'Збереження...' : 'Додати'}
      </button>
    </form>
  )
}
