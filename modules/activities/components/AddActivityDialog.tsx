'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ActivityType } from '@prisma/client'
import { AgendaEditor, type DraftItem } from './AgendaEditor'
import { createActivity } from '../actions/activityActions'

interface KnowledgeTopic {
  id: string
  name: string
  knowledgeTable: { name: string }
}

interface Member {
  id: string
  firstName: string
  lastName: string
}

interface AddActivityDialogProps {
  availableTopics: KnowledgeTopic[]
  availableMembers: Member[]
}

const typeLabels: Record<ActivityType, string> = {
  Gathering: 'Gathering',
  SIT: 'SIT',
  LeisureEvent: 'Leisure Event',
}

export function AddActivityDialog({ availableTopics, availableMembers }: AddActivityDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [type, setType] = useState<ActivityType | ''>('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [agendaItems, setAgendaItems] = useState<DraftItem[]>([])
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState('')

  function resetForm() {
    setName('')
    setType('')
    setDate('')
    setDescription('')
    setAgendaItems([])
    setSelectedMemberIds([])
    setMemberSearch('')
    setError(null)
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) resetForm()
  }

  function toggleMember(memberId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  const selectedMemberSet = new Set(selectedMemberIds)

  const filteredMembers = availableMembers.filter((m) => {
    if (selectedMemberSet.has(m.id)) return false
    const q = memberSearch.toLowerCase()
    return !q || `${m.lastName} ${m.firstName}`.toLowerCase().includes(q)
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!type) {
      setError('Оберіть тип заходу')
      return
    }
    if (!name.trim() || !date) return

    setError(null)
    startTransition(async () => {
      const result = await createActivity({
        name: name.trim(),
        type: type as ActivityType,
        date: new Date(date),
        description: description.trim() || undefined,
        agendaItems: agendaItems.map((item) =>
          item.kind === 'text'
            ? { kind: 'text' as const, text: item.text }
            : { kind: 'topic' as const, knowledgeTopicId: item.knowledgeTopicId! }
        ),
        memberIds: selectedMemberIds,
      })
      if (result.success) {
        handleOpenChange(false)
      } else {
        setError(result.error ?? 'Помилка')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="bg-[#E85D04] hover:bg-[#F4845F] text-white rounded-[7px] px-[14px] py-[7px] text-xs font-semibold h-auto" />
        }
      >
        {'+ Додати захід'}
      </DialogTrigger>

      <DialogContent className="max-w-[920px] sm:max-w-[920px] max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-base">{'Новий захід'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Two-column body */}
          <div className="flex flex-1 min-h-0 divide-x divide-gray-100">

            {/* ── Left column: basic info ── */}
            <div className="w-[360px] shrink-0 overflow-y-auto px-6 py-5 space-y-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.8px]">
                {'Основна інформація'}
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="add-name" className="text-xs text-gray-600">
                  {'Назва'}
                </Label>
                <Input
                  id="add-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Назва заходу..."
                  required
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">{'Тип'}</Label>
                  <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Оберіть тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-date" className="text-xs text-gray-600">
                    {'Дата'}
                  </Label>
                  <Input
                    id="add-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-desc" className="text-xs text-gray-600">
                  {'Опис'}{' '}
                  <span className="text-gray-400 font-normal">{'(необовʼязково)'}</span>
                </Label>
                <Textarea
                  id="add-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опис заходу..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            {/* ── Right column: agenda + attendance ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Agenda */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.8px] whitespace-nowrap">
                    {'Агенда'}
                  </p>
                  <span className="text-[10px] text-gray-400">
                    {agendaItems.length > 0 ? `${agendaItems.length} пунктів` : '(необовʼязково)'}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <AgendaEditor
                  items={agendaItems}
                  onItemsChange={setAgendaItems}
                  availableTopics={availableTopics}
                />
              </div>

              {/* Attendance */}
              {availableMembers.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.8px] whitespace-nowrap">
                      {'Відвідуваність'}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {selectedMemberIds.length > 0
                        ? `${selectedMemberIds.length} учасників`
                        : '(необовʼязково)'}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* Selected chips */}
                  {selectedMemberIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {selectedMemberIds.map((id) => {
                        const m = availableMembers.find((m) => m.id === id)
                        if (!m) return null
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8EDF8] text-[#0A3D91] text-[11px] rounded-[5px]"
                          >
                            {m.lastName} {m.firstName}
                            <button
                              type="button"
                              onClick={() => toggleMember(id)}
                              className="hover:text-red-500 ml-0.5 leading-none"
                            >
                              ×
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  <Input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Пошук учасника..."
                    className="h-8 text-sm mb-1.5"
                  />
                  <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-[7px]">
                    {filteredMembers.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-gray-400 text-center">
                        {selectedMemberIds.length === availableMembers.length
                          ? 'Всі учасники вже додані'
                          : 'Учасників не знайдено'}
                      </p>
                    ) : (
                      filteredMembers.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMember(m.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#E8EDF8] transition-colors border-b border-gray-50 last:border-0"
                        >
                          {m.lastName} {m.firstName}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sticky footer ── */}
          <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-white flex items-center justify-between gap-3">
            <div>{error && <p className="text-red-500 text-xs">{error}</p>}</div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="text-xs"
              >
                {'Скасувати'}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !name.trim() || !date || !type}
                className="bg-[#E85D04] hover:bg-[#F4845F] text-white text-xs rounded-[7px] min-w-[90px]"
              >
                {isPending ? 'Збереження...' : 'Зберегти'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
