'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { deleteActivity } from '../actions/activityActions'

interface DeleteActivityButtonProps {
  activityId: string
}

export function DeleteActivityButton({ activityId }: DeleteActivityButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await deleteActivity(activityId)
    router.push('/activities')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="h-9 px-4 text-[13px] font-medium text-red-500 border border-red-200 rounded-[8px] hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {loading ? 'Видалення...' : 'Видалити'}
      </button>
      <ConfirmDialog
        open={open}
        title="Видалити захід?"
        description="Всі дані заходу будуть видалені назавжди. Цю дію неможливо скасувати."
        confirmLabel="Видалити"
        cancelLabel="Скасувати"
        dangerous
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
