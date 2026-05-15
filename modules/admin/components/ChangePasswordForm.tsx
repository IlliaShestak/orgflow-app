'use client'

import { useState, useTransition } from 'react'
import { changePassword } from '../actions/changePassword'

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await changePassword(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        ;(e.target as HTMLFormElement).reset()
        setTimeout(() => onSuccess?.(), 1000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
          Поточний пароль
        </label>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
          Новий пароль
        </label>
        <input
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Мінімум 6 символів"
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.5px] mb-1">
          Підтвердіть новий пароль
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors"
        />
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}
      {success && (
        <p className="text-[12px] text-[#0B7B45] font-medium">Пароль успішно змінено</p>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] transition-colors disabled:opacity-50"
        >
          {isPending ? 'Збереження...' : 'Змінити пароль'}
        </button>
      </div>
    </form>
  )
}
