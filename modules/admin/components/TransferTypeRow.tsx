'use client'

import { useState, useTransition } from 'react'
import { TransferType } from '../types'
import { updateTransferType } from '../actions/updateTransferType'
import { deleteTransferType } from '../actions/deleteTransferType'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'

interface TransferTypeRowProps {
  item: TransferType
}

export function TransferTypeRow({ item }: TransferTypeRowProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.name)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    const formData = new FormData()
    formData.set('id', item.id)
    formData.set('name', name)
    startTransition(async () => {
      const result = await updateTransferType(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTransferType(item.id)
      if (result?.error) {
        setError(result.error)
        setConfirmDelete(false)
      }
    })
  }

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-[#FAFBFD] transition-colors">
        <td className="px-4 py-3">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="border border-gray-200 rounded-[7px] px-3 py-1 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] w-48"
              />
              <button
                onClick={handleSave}
                disabled={isPending || !name.trim()}
                className="px-3 py-1 text-[11px] font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] disabled:opacity-50 transition-colors"
              >
                {isPending ? '...' : 'Зберегти'}
              </button>
              <button
                onClick={() => { setEditing(false); setName(item.name) }}
                className="px-3 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-gray-300 transition-colors"
              >
                Скасувати
              </button>
            </div>
          ) : (
            <span className="text-[13px] text-gray-800">{item.name}</span>
          )}
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2 justify-end">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-[#E85D04] hover:text-[#E85D04] transition-colors"
              >
                Редагувати
              </button>
            )}
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1 text-[11px] font-medium text-red-500 bg-white border border-red-200 rounded-[7px] hover:bg-red-50 transition-colors"
            >
              Видалити
            </button>
          </div>
        </td>
      </tr>

      <ConfirmDialog
        open={confirmDelete}
        title="Видалити тип передачі знань?"
        description={`"${item.name}" буде видалено. Якщо тип використовується в таблицях КСПЗ, видалення неможливе.`}
        confirmLabel="Видалити"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        dangerous
      />
    </>
  )
}
