'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { deleteKspzTable } from '../actions/kspzActions'

interface DeleteKspzTableButtonProps {
  tableId: string
  tableName: string
}

export function DeleteKspzTableButton({ tableId, tableName }: DeleteKspzTableButtonProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await deleteKspzTable(tableId)
      if (result.success) {
        router.push('/knowledge')
      } else {
        setError(result.error ?? 'Помилка видалення')
        setOpen(false)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-[7px] transition-colors disabled:opacity-50"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 3h8M5 3V2h2v1M4.5 3v6m3-6v6M3 3l.5 7h5L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Видалити таблицю
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <ConfirmDialog
        open={open}
        title="Видалити таблицю знань?"
        description={`Таблиця "${tableName}" та всі її теми будуть видалені назавжди. Цю дію не можна скасувати.`}
        confirmLabel="Видалити"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
        dangerous
      />
    </>
  )
}
