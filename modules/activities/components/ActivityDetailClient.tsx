'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ActivityType } from '@prisma/client'
import { ActivityTypeBadge } from './ActivityTypeBadge'
import { AgendaEditor, type DraftItem } from './AgendaEditor'
import { AttendancePanel } from './AttendancePanel'
import { updateActivity, saveAgenda } from '../actions/activityActions'

interface KnowledgeTopic {
  id: string
  name: string
  knowledgeTable: { name: string }
}

interface AgendaItemData {
  id: string
  activityId: string
  order: number
  text: string | null
  knowledgeTopicId: string | null
  knowledgeTopic: { id: string; name: string; knowledgeTable: { name: string } } | null
}

interface AttendanceData {
  id: string
  memberId: string
  member: { id: string; firstName: string; lastName: string }
}

interface ActivityData {
  id: string
  name: string
  type: ActivityType
  date: Date
  description: string | null
  agendaItems: AgendaItemData[]
  attendance: AttendanceData[]
}

interface MemberOption {
  id: string
  firstName: string
  lastName: string
}

interface ActivityDetailClientProps {
  activity: ActivityData
  allTopics: KnowledgeTopic[]
  availableMembers: MemberOption[]
  canEdit: boolean
}

const typeLabels: Record<ActivityType, string> = {
  Gathering: 'Gathering',
  SIT: 'SIT',
  LeisureEvent: 'Leisure Event',
  ThursdayMeeting: 'Четвергові збори',
}

function toDateInputValue(date: Date): string {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function agendaItemsToDraft(items: AgendaItemData[]): DraftItem[] {
  return items.map((item) => ({
    id: item.id,
    kind: item.knowledgeTopicId ? 'topic' : 'text',
    text: item.text ?? '',
    knowledgeTopicId: item.knowledgeTopicId,
    topicName: item.knowledgeTopic?.name,
    tableName: item.knowledgeTopic?.knowledgeTable.name,
  }))
}

export function ActivityDetailClient({
  activity,
  allTopics,
  availableMembers,
  canEdit,
}: ActivityDetailClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<ActivityType>(ActivityType.Gathering)
  const [editDate, setEditDate] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editAgendaItems, setEditAgendaItems] = useState<DraftItem[]>([])

  function handleStartEdit() {
    setEditName(activity.name)
    setEditType(activity.type)
    setEditDate(toDateInputValue(activity.date))
    setEditDescription(activity.description ?? '')
    setEditAgendaItems(agendaItemsToDraft(activity.agendaItems))
    setError(null)
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setError(null)
  }

  function handleSave() {
    if (!editName.trim() || !editDate) return
    setError(null)
    startTransition(async () => {
      const activityResult = await updateActivity({
        id: activity.id,
        name: editName.trim(),
        type: editType,
        date: new Date(editDate),
        description: editDescription.trim() || undefined,
      })
      if (!activityResult.success) {
        setError(activityResult.error ?? 'Помилка збереження')
        return
      }

      const agendaResult = await saveAgenda({
        activityId: activity.id,
        items: editAgendaItems.map((item, i) => ({
          id: item.id,
          order: i,
          text: item.kind === 'text' ? item.text : null,
          knowledgeTopicId: item.kind === 'topic' ? item.knowledgeTopicId : null,
        })),
      })
      if (!agendaResult.success) {
        setError(agendaResult.error ?? 'Помилка збереження агенди')
        return
      }

      setIsEditing(false)
      router.refresh()
    })
  }

  const formattedDate = new Date(activity.date).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      {isEditing ? (
        /* ── Edit mode ─────────────────────────────────────────── */
        <div className="bg-[#FFF8F4] border border-[#FDCBA8] rounded-[12px] p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] font-semibold text-[#E85D04]">Редагування заходу</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                className="text-xs h-8 rounded-[7px]"
              >
                Скасувати
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isPending || !editName.trim() || !editDate}
                className="bg-[#E85D04] hover:bg-[#F4845F] text-white text-xs h-8 rounded-[7px] min-w-[110px]"
              >
                {isPending ? 'Збереження...' : 'Зберегти зміни'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs text-gray-600">
                Назва
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Тип</Label>
              <Select value={editType} onValueChange={(v) => setEditType(v as ActivityType)}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue />
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
              <Label htmlFor="edit-date" className="text-xs text-gray-600">
                Дата
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-9 bg-white"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="edit-desc" className="text-xs text-gray-600">
                Опис{' '}
                <span className="text-gray-400 font-normal">(необовʼязково)</span>
              </Label>
              <Textarea
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Опис заходу..."
                rows={2}
                className="resize-none bg-white"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 mt-4">{error}</p>}
        </div>
      ) : (
        /* ── View mode header ───────────────────────────────────── */
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ActivityTypeBadge type={activity.type} />
              <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">
                {activity.name}
              </h1>
            </div>
            <p className="text-sm text-gray-400">{formattedDate}</p>
            {activity.description && (
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
            )}
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={handleStartEdit}
              className="text-xs h-8 rounded-[7px] shrink-0 ml-4"
            >
              Редагувати
            </Button>
          )}
        </div>
      )}

      {/* ── Content grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda */}
        <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-800">Агенда</h2>
            <span className="text-[11px] text-gray-400">
              {isEditing ? editAgendaItems.length : activity.agendaItems.length} пунктів
            </span>
          </div>
          <div className="p-4">
            {isEditing && canEdit ? (
              <AgendaEditor
                items={editAgendaItems}
                onItemsChange={setEditAgendaItems}
                availableTopics={allTopics}
              />
            ) : (
              <div className="space-y-2">
                {activity.agendaItems.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Агенда порожня</p>
                ) : (
                  activity.agendaItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] rounded-[8px]"
                    >
                      <span className="text-[11px] text-gray-400 w-5">{i + 1}</span>
                      {item.knowledgeTopic ? (
                        <span className="text-sm text-gray-700">
                          <span className="text-[11px] text-[#0B7B45] font-medium mr-1">
                            [КСПЗ]
                          </span>
                          {item.knowledgeTopic.knowledgeTable.name} — {item.knowledgeTopic.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-700">{item.text}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-800">Відвідуваність</h2>
            <span className="text-[11px] text-gray-400">
              {activity.attendance.length} присутніх
            </span>
          </div>
          <div className="p-4">
            <AttendancePanel
              activityId={activity.id}
              attendance={activity.attendance}
              availableMembers={availableMembers}
            />
          </div>
        </div>
      </div>
    </>
  )
}
