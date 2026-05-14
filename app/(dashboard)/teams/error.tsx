'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-7 flex flex-col items-center justify-center min-h-64 gap-4">
      <p className="text-gray-500">Щось пішло не так</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-brand-blue text-white rounded-md text-sm"
      >
        Спробувати знову
      </button>
    </div>
  )
}
