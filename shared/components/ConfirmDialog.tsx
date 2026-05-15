'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  dangerous?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Підтвердити',
  cancelLabel = 'Скасувати',
  onConfirm,
  onCancel,
  dangerous = false,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-[10px] border border-gray-100 shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-[13px] text-gray-500 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-gray-300 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              dangerous
                ? 'px-4 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-[7px] transition-colors'
                : 'px-4 py-2 text-xs font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] transition-colors'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
