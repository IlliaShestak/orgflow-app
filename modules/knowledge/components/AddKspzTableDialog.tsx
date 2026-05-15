'use client'

import { useState, useTransition } from 'react'
import { MemberStatus } from '@prisma/client'
import { createKspzTable } from '../actions/kspzActions'

interface TransferType {
  id: string
  name: string
}

const statusLabels: Record<MemberStatus, string> = {
  Observer: 'Observer',
  Baby: 'Baby',
  Full: 'Full',
  Alumni: 'Alumni',
}

export function AddKspzTableDialog({ transferTypes }: { transferTypes: TransferType[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  function toggleType(id: string) {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string
    const targetStatusRaw = fd.get('targetStatus') as string

    setError(null)
    startTransition(async () => {
      const result = await createKspzTable({
        name,
        targetStatus: targetStatusRaw === 'all' ? null : (targetStatusRaw as MemberStatus),
        transferTypeIds: selectedTypes,
      })
      if (result.success) {
        setOpen(false)
        setSelectedTypes([])
      } else {
        setError(result.error ?? 'Помилка')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-[#E85D04] hover:bg-[#F4845F] text-white rounded-[7px] px-[14px] py-[7px] text-xs font-semibold transition-colors"
      >
        + Нова таблиця
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-[12px] p-6 w-full max-w-md shadow-xl">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Нова таблиця КСПЗ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="tt-name">
              Назва таблиці
            </label>
            <input
              id="tt-name"
              name="name"
              required
              placeholder="Назва..."
              className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="tt-status">
              Цільовий статус
            </label>
            <select
              id="tt-status"
              name="targetStatus"
              defaultValue="all"
              className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04] transition-colors bg-white"
            >
              <option value="all">Всі статуси</option>
              {Object.entries(statusLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Типи передачі знань</p>
            <div className="space-y-1.5">
              {transferTypes.map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t.id)}
                    onChange={() => toggleType(t.id)}
                    className="accent-[#E85D04] w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{t.name}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border border-gray-200 rounded-[7px] px-4 py-2 text-xs text-gray-600 hover:border-gray-300 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isPending || selectedTypes.length === 0}
              className="bg-[#E85D04] hover:bg-[#F4845F] text-white rounded-[7px] px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isPending ? 'Створення...' : 'Створити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
