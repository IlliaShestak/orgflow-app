'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { deleteMember } from '../actions/memberActions'

export function DeleteMemberButton({ memberId }: { memberId: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    const result = await deleteMember(memberId)
    if (result.success) {
      router.push('/information-book')
    } else {
      setLoading(false)
      setConfirm(false)
      setError(result.error ?? 'Помилка видалення')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="h-9 px-4 text-[13px] font-medium text-red-500 border border-red-200 rounded-[8px] hover:bg-red-50 transition-colors"
      >
        Видалити
      </button>

      {error && (
        <p className="text-[12px] text-red-500 mt-1">{error}</p>
      )}

      <ConfirmDialog
        open={confirm}
        title="Видалити учасника?"
        description="Всі дані учасника будуть видалені назавжди: членство в командах, відвідуваність, покриття знань, обліковий запис. Цю дію неможливо скасувати."
        confirmLabel={loading ? 'Видалення...' : 'Видалити'}
        cancelLabel="Скасувати"
        dangerous
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(false)}
      />
    </>
  )
}
