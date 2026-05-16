'use client'

import { useState, useTransition } from 'react'
import { TeamType } from '@prisma/client'
import { updateTeam, archiveTeam, unarchiveTeam } from '../actions/updateTeam'

interface TeamDetailHeaderProps {
  team: {
    id: string
    name: string
    type: TeamType
    startDate: Date | null
    endDate: Date | null
    isArchived: boolean
    notes: string | null
  }
  canEdit: boolean
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSaved: () => void
}

const TYPE_LABELS: Record<string, string> = {
  Coreteam: 'Coreteam',
  Project: 'Project',
  Team: 'Team',
}

function toDateInput(date: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TeamDetailHeader({
  team,
  canEdit,
  isEditing,
  onEdit,
  onCancelEdit,
  onSaved,
}: TeamDetailHeaderProps) {
  const [name, setName] = useState(team.name)
  const [type, setType] = useState<string>(team.type)
  const [startDate, setStartDate] = useState(toDateInput(team.startDate))
  const [endDate, setEndDate] = useState(toDateInput(team.endDate))
  const [notes, setNotes] = useState(team.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleStartEdit() {
    setName(team.name)
    setType(team.type)
    setStartDate(toDateInput(team.startDate))
    setEndDate(toDateInput(team.endDate))
    setNotes(team.notes ?? '')
    setError(null)
    onEdit()
  }

  function handleSave() {
    if (!name.trim()) return
    setError(null)
    const formData = new FormData()
    formData.set('id', team.id)
    formData.set('name', name.trim())
    formData.set('type', type)
    if (startDate) formData.set('startDate', startDate)
    if (endDate) formData.set('endDate', endDate)
    formData.set('notes', notes)
    startTransition(async () => {
      const result = await updateTeam(formData)
      if (result?.error) setError(result.error)
      else onSaved()
    })
  }

  function handleArchive() {
    startTransition(async () => {
      await archiveTeam(team.id)
    })
  }

  function handleUnarchive() {
    startTransition(async () => {
      await unarchiveTeam(team.id)
    })
  }

  const formattedStart = team.startDate
    ? new Date(team.startDate).toLocaleDateString('uk-UA')
    : null
  const formattedEnd = team.endDate
    ? new Date(team.endDate).toLocaleDateString('uk-UA')
    : null

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-100 rounded-[10px] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.8px]">
            {'Редагування команди'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-[7px] hover:bg-gray-50 transition-colors"
            >
              {'Скасувати'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !name.trim()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#E85D04] hover:bg-[#F4845F] rounded-[7px] disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-[0.5px]">
              {'Назва'}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-[0.5px]">
                {'Тип'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
              >
                <option value="Coreteam">Coreteam</option>
                <option value="Project">Project</option>
                <option value="Team">Team</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-[0.5px]">
                {'Початок'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-[0.5px]">
                {'Завершення'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-[#E85D04] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-[0.5px]">
              {'Додаткова інформація'}
              <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">
                {'(необовʼязково)'}
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Будь-яка додаткова інформація про команду..."
              rows={3}
              className="w-full border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E85D04] transition-colors resize-none"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">{team.name}</h1>
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8EDF8] text-[#0A3D91]">
            {TYPE_LABELS[team.type] ?? team.type}
          </span>
          {team.isArchived && (
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
              {'Архів'}
            </span>
          )}
        </div>

        {(formattedStart || formattedEnd) && (
          <div className="flex items-center gap-2 mb-2">
            {formattedStart && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0A3D91] bg-[#E8EDF8] px-3 py-1 rounded-[6px]">
                <span className="text-[10px] font-normal text-[#4472CA]">{'від'}</span>
                {formattedStart}
              </span>
            )}
            {formattedEnd && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0A3D91] bg-[#E8EDF8] px-3 py-1 rounded-[6px]">
                <span className="text-[10px] font-normal text-[#4472CA]">{'до'}</span>
                {formattedEnd}
              </span>
            )}
          </div>
        )}

        {team.notes && (
          <p className="text-[13px] text-gray-600 max-w-xl whitespace-pre-wrap">{team.notes}</p>
        )}
      </div>

      {canEdit && (
        <div className="flex gap-2 shrink-0 ml-4">
          <button
            type="button"
            onClick={handleStartEdit}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-white rounded-[7px] hover:bg-gray-50 transition-colors"
          >
            {'Редагувати'}
          </button>
          {team.isArchived ? (
            <button
              type="button"
              onClick={handleUnarchive}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium text-[#0A3D91] border border-[#C5D5F0] bg-[#E8EDF8] rounded-[7px] hover:bg-[#D8E5F5] disabled:opacity-50 transition-colors"
            >
              {isPending ? '...' : 'Розархівувати'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 bg-white rounded-[7px] hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {isPending ? '...' : 'Архівувати'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
