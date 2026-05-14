'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Невірний email або пароль')
    } else {
      router.push('/information-book')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[7px] focus:outline-none focus:border-[#0A3D91] focus:ring-1 focus:ring-[#0A3D91] transition-colors"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Пароль
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[7px] focus:outline-none focus:border-[#0A3D91] focus:ring-1 focus:ring-[#0A3D91] transition-colors"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-[6px]">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 text-sm font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] disabled:opacity-50 disabled:cursor-not-allowed rounded-[7px] transition-colors"
      >
        {loading ? 'Вхід...' : 'Увійти'}
      </button>
    </form>
  )
}
