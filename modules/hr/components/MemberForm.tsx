'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMember, updateMember } from '../actions/memberActions'
import { MemberCreateInput } from '../validators/memberSchema'

interface MentorOption {
  id: string
  firstName: string
  lastName: string
}

interface MemberFormProps {
  initialData?: Partial<MemberCreateInput> & { id?: string }
  mentors: MentorOption[]
  onClose?: () => void
}

export function MemberForm({ initialData, mentors, onClose }: MemberFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [form, setForm] = useState({
    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    telegram: initialData?.telegram ?? '',
    instagram: initialData?.instagram ?? '',
    facebook: initialData?.facebook ?? '',
    family: initialData?.family ?? '',
    gender: initialData?.gender ?? '',
    studyYear: initialData?.studyYear?.toString() ?? '',
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
    joinedAt: initialData?.joinedAt ? new Date(initialData.joinedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: initialData?.status ?? 'Observer',
    state: initialData?.state ?? 'Active',
    mentorId: initialData?.mentorId ?? '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || null,
      phone: form.phone || null,
      telegram: form.telegram || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      family: form.family || null,
      gender: (form.gender as 'Male' | 'Female') || undefined,
      studyYear: form.studyYear ? parseInt(form.studyYear) : null,
      birthDate: form.birthDate ? new Date(form.birthDate) : null,
      joinedAt: new Date(form.joinedAt),
      status: form.status as 'Observer' | 'Baby' | 'Full' | 'Alumni',
      state: form.state as 'Active' | 'Inactive',
      mentorId: form.mentorId || null,
    }

    const result = isEdit
      ? await updateMember({ ...payload, id: initialData!.id! })
      : await createMember(payload)

    setLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Помилка')
    } else {
      onClose?.()
      router.refresh()
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-[7px] focus:outline-none focus:border-[#0A3D91] focus:ring-1 focus:ring-[#0A3D91] transition-colors'
  const labelClass = 'block text-xs font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Ім&apos;я *</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputClass} placeholder="Іван" />
        </div>
        <div>
          <label className={labelClass}>Прізвище *</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} required className={inputClass} placeholder="Коваленко" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Стать</label>
          <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
            <option value="">— не вказано —</option>
            <option value="Male">Чоловіча</option>
            <option value="Female">Жіноча</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Рік навчання</label>
          <select name="studyYear" value={form.studyYear} onChange={handleChange} className={inputClass}>
            <option value="">— не вказано —</option>
            {[1,2,3,4,5,6].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Дата народження</label>
          <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Дата вступу *</label>
          <input type="date" name="joinedAt" value={form.joinedAt} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Статус</label>
          <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
            <option value="Observer">Observer</option>
            <option value="Baby">Baby</option>
            <option value="Full">Full</option>
            <option value="Alumni">Alumni</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Стан</label>
          <select name="state" value={form.state} onChange={handleChange} className={inputClass}>
            <option value="Active">Активний</option>
            <option value="Inactive">Неактивний</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Ментор</label>
        <select name="mentorId" value={form.mentorId} onChange={handleChange} className={inputClass}>
          <option value="">— без ментора —</option>
          {mentors.map(m => (
            <option key={m.id} value={m.id}>{m.lastName} {m.firstName}</option>
          ))}
        </select>
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="ivan@example.com" />
        </div>
        <div>
          <label className={labelClass}>Телефон</label>
          <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+380..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Telegram</label>
          <input name="telegram" value={form.telegram} onChange={handleChange} className={inputClass} placeholder="@username" />
        </div>
        <div>
          <label className={labelClass}>Instagram</label>
          <input name="instagram" value={form.instagram} onChange={handleChange} className={inputClass} placeholder="@username" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Facebook</label>
        <input name="facebook" value={form.facebook} onChange={handleChange} className={inputClass} placeholder="facebook.com/..." />
      </div>

      <div>
        <label className={labelClass}>Родина (free text)</label>
        <textarea name="family" value={form.family} onChange={handleChange} className={inputClass} rows={2} placeholder="Опис родини..." />
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-[6px]">{error}</p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        {onClose && (
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:border-gray-300 transition-colors">
            Скасувати
          </button>
        )}
        <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] disabled:opacity-50 rounded-[7px] transition-colors">
          {loading ? 'Збереження...' : 'Зберегти'}
        </button>
      </div>
    </form>
  )
}
