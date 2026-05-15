'use client'

import { useState, useTransition } from 'react'
import { UserWithMember } from '../types'
import { updateUserRole } from '../actions/updateUserRole'
import { deleteUser } from '../actions/deleteUser'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'

interface UserTableRowProps {
  user: UserWithMember
}

const ROLES = [
  { value: 'Admin', label: 'Admin' },
  { value: 'VP4HR', label: 'VP4HR' },
  { value: 'FullMember', label: 'Full Member' },
]

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Admin',
  VP4HR: 'VP4HR',
  FullMember: 'Full Member',
}

export function UserTableRow({ user }: UserTableRowProps) {
  const [editing, setEditing] = useState(false)
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  function handleRoleChange() {
    setError(null)
    const formData = new FormData()
    formData.set('userId', user.id)
    formData.set('role', selectedRole)
    startTransition(async () => {
      const result = await updateUserRole(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteUser(user.id)
      setConfirmDelete(false)
    })
  }

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-[#FAFBFD] transition-colors">
        <td className="px-4 py-3">
          <p className="text-[13px] text-gray-800">{user.email}</p>
          {user.generatedPassword && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-amber-600 font-medium">Тимчасовий пароль:</span>
              <code className="text-[11px] font-mono text-gray-600">
                {showPassword ? user.generatedPassword : '••••••••••'}
              </code>
              <button
                onClick={() => setShowPassword(v => !v)}
                className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? 'Сховати' : 'Показати'}
              </button>
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-[13px] text-gray-600">
          {user.member ? `${user.member.lastName} ${user.member.firstName}` : '—'}
        </td>
        <td className="px-4 py-3">
          {editing ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as typeof selectedRole)}
                className="border border-gray-200 rounded-[7px] px-2 py-1 text-[12px] text-gray-800 focus:outline-none focus:border-[#E85D04]"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                onClick={handleRoleChange}
                disabled={isPending}
                className="px-3 py-1 text-[11px] font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] disabled:opacity-50 transition-colors"
              >
                {isPending ? '...' : 'Зберегти'}
              </button>
              <button
                onClick={() => { setEditing(false); setSelectedRole(user.role) }}
                className="px-3 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-gray-300 transition-colors"
              >
                Скасувати
              </button>
            </div>
          ) : (
            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E8EDF8] text-[#0A3D91]">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          )}
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </td>
        <td className="px-4 py-3 text-[12px] text-gray-400">
          {new Date(user.createdAt).toLocaleDateString('uk-UA')}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-[#E85D04] hover:text-[#E85D04] transition-colors"
              >
                Змінити роль
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
        title="Видалити користувача?"
        description={`Обліковий запис ${user.email} буде видалено. Учасник залишиться в системі.`}
        confirmLabel="Видалити"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        dangerous
      />
    </>
  )
}
