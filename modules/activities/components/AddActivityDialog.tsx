'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ActivityType } from '@prisma/client'
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

type DraftAgendaItem =
  | { localId: string; kind: 'text'; text: string }
  | { localId: string; kind: 'topic'; topicId: string; topicName: string; tableName: string }

const typeLabels: Record<ActivityType, string> = {
  Gathering: 'Gathering',
  SIT: 'SIT',
  LeisureEvent: 'Leisure Event',
}

export function AddActivityDialog({ availableTopics, availableMembers }: AddActivityDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState<ActivityType | ''>('')
  const [agendaItems, setAgendaItems] = useState<DraftAgendaItem[]>([])
  const [topicSearch, setTopicSearch] = useState('')
  const [newTextItem, setNewTextItem] = useState('')
  const [showAgenda, setShowAgenda] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState('')
  const [showAttendance, setShowAttendance] = useState(false)

  function resetForm() {
    setType('')
    setAgendaItems([])
    setTopicSearch('')
    setNewTextItem('')
    setShowAgenda(false)
    setSelectedMemberIds([])
    setMemberSearch('')
    setShowAttendance(false)
    setError(null)
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) resetForm()
  }

  function addTopicItem(topic: KnowledgeTopic) {
    setAgendaItems((prev) => [
      ...prev,
      {
        localId: Math.random().toString(36).slice(2),
        kind: 'topic',
        topicId: topic.id,
        topicName: topic.name,
        tableName: topic.knowledgeTable.name,
      },
    ])
  }

  function addTextItem() {
    const text = newTextItem.trim()
    if (!text) return
    setAgendaItems((prev) => [
      ...prev,
      { localId: Math.random().toString(36).slice(2), kind: 'text', text },
    ])
    setNewTextItem('')
  }

  function removeAgendaItem(localId: string) {
    setAgendaItems((prev) => prev.filter((i) => i.localId !== localId))
  }

  function toggleMember(memberId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  const addedTopicIds = new Set(
    agendaItems.filter((i): i is Extract<DraftAgendaItem, { kind: 'topic' }> => i.kind === 'topic').map((i) => i.topicId)
  )
  const selectedMemberSet = new Set(selectedMemberIds)

  const filteredTopics = availableTopics.filter((t) => {
    if (addedTopicIds.has(t.id)) return false
    const q = topicSearch.toLowerCase()
    return t.name.toLowerCase().includes(q) || t.knowledgeTable.name.toLowerCase().includes(q)
  })

  const filteredMembers = availableMembers.filter((m) => {
    if (selectedMemberSet.has(m.id)) return false
    const q = memberSearch.toLowerCase()
    return `${m.lastName} ${m.firstName}`.toLowerCase().includes(q)
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!type) {
      setError('Оберіть тип заходу')
      return
    }
    const fd = new FormData(e.currentTarget)
    const name = (fd.get('name') as string).trim()
    const date = fd.get('date') as string
    const rawDesc = (fd.get('description') as string).trim()
    const description = rawDesc || undefined

    setError(null)
    startTransition(async () => {
      const result = await createActivity({
        name,
        type: type as ActivityType,
        date: new Date(date),
        description,
        agendaItems: agendaItems.map((item) =>
          item.kind === 'text'
            ? { kind: 'text' as const, text: item.text }
            : { kind: 'topic' as const, knowledgeTopicId: item.topicId }
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{'Новий захід'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">{'Назва'}</Label>
            <Input id="name" name="name" placeholder="Назва заходу..." required />
          </div>

          {/* Type + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{'Тип'}</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть тип" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">{'Дата'}</Label>
              <Input id="date" name="date" type="date" required />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              {'Опис'}
              <span className="text-gray-400 text-[11px] ml-1.5">{'(необовʼязково)'}</span>
            </Label>
            <Textarea id="description" name="description" placeholder="Опис заходу..." rows={2} />
          </div>

          {/* Agenda section */}
          <div className="border border-gray-100 rounded-[8px] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAgenda((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F8FA] text-left text-[13px] font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>
                {'Порядок денний'}
                <span className="text-gray-400 text-[11px] ml-1.5">{'(необовʼязково)'}</span>
                {agendaItems.length > 0 && (
                  <span className="ml-2 text-[11px] text-[#E85D04] font-semibold">
                    {agendaItems.length} пунктів
                  </span>
                )}
              </span>
              <span className="text-gray-400 text-[10px]">{showAgenda ? '▲' : '▼'}</span>
            </button>

            {showAgenda && (
              <div className="p-4 space-y-3">
                {/* Added items */}
                {agendaItems.length > 0 && (
                  <div className="space-y-1">
                    {agendaItems.map((item, i) => (
                      <div
                        key={item.localId}
                        className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] rounded-[7px]"
                      >
                        <span className="text-[11px] text-gray-400 w-5 shrink-0">{i + 1}</span>
                        {item.kind === 'topic' ? (
                          <span className="flex-1 text-sm text-gray-700 min-w-0">
                            <span className="text-[11px] text-[#0B7B45] font-medium mr-1">
                              {'[КСПЗ]'}
                            </span>
                            {item.tableName} — {item.topicName}
                          </span>
                        ) : (
                          <span className="flex-1 text-sm text-gray-700 min-w-0 truncate">
                            {item.text}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAgendaItem(item.localId)}
                          className="text-red-400 hover:text-red-600 text-xs shrink-0 ml-1"
                        >
                          {'✕'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add text item */}
                <div className="flex gap-2">
                  <Input
                    value={newTextItem}
                    onChange={(e) => setNewTextItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTextItem()
                      }
                    }}
                    placeholder="Текстовий пункт..."
                    className="flex-1 h-8 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTextItem}
                    className="text-xs h-8 shrink-0"
                  >
                    {'+ Текст'}
                  </Button>
                </div>

                {/* Topic search + list */}
                <div className="space-y-1.5">
                  <Input
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    placeholder="Пошук теми КСПЗ..."
                    className="h-8 text-sm"
                  />
                  <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-[7px]">
                    {filteredTopics.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-gray-400 text-center">
                        {availableTopics.length === 0 ? 'Теми КСПЗ відсутні' : 'Теми не знайдено'}
                      </p>
                    ) : (
                      filteredTopics.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => addTopicItem(t)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#E6F5EE] transition-colors border-b border-gray-50 last:border-0"
                        >
                          <span className="text-[#0B7B45] font-medium">{t.knowledgeTable.name}</span>
                          <span className="text-gray-400 mx-1">{'—'}</span>
                          {t.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attendance section */}
          {availableMembers.length > 0 && (
            <div className="border border-gray-100 rounded-[8px] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAttendance((p) => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F8FA] text-left text-[13px] font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span>
                  {'Відвідуваність'}
                  <span className="text-gray-400 text-[11px] ml-1.5">{'(необовʼязково)'}</span>
                  {selectedMemberIds.length > 0 && (
                    <span className="ml-2 text-[11px] text-[#E85D04] font-semibold">
                      {selectedMemberIds.length} учасників
                    </span>
                  )}
                </span>
                <span className="text-gray-400 text-[10px]">{showAttendance ? '▲' : '▼'}</span>
              </button>

              {showAttendance && (
                <div className="p-4 space-y-3">
                  {/* Selected member chips */}
                  {selectedMemberIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
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
                              {'×'}
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Member search + list */}
                  <Input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Пошук учасника..."
                    className="h-8 text-sm"
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
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
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
              disabled={isPending}
              className="bg-[#E85D04] hover:bg-[#F4845F] text-white text-xs rounded-[7px]"
            >
              {isPending ? 'Збереження...' : 'Зберегти'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
