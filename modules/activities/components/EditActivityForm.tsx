'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ActivityType } from '@prisma/client'
import { AgendaEditor, type DraftItem } from './AgendaEditor'
import { AttendanceTable } from './AttendanceTable'
import { updateActivity, saveAgenda, setAttendance, syncCoverageForActivity } from '../actions/activityActions'

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

interface MemberOption {
  id: string
  firstName: string
  lastName: string
  status: 'Observer' | 'Baby' | 'Full' | 'Alumni'
  state: 'Active' | 'Inactive'
  joinedAt: Date | string
}

interface EditActivityFormProps {
  activity: {
    id: string
    name: string
    type: ActivityType
    date: Date
    description: string | null
    agendaItems: AgendaItemData[]
  }
  availableTopics: KnowledgeTopic[]
  members: MemberOption[]
  initialAttendeeIds: string[]
  hasKnowledgeTopics: boolean
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

export function EditActivityForm({
  activity,
  availableTopics,
  members,
  initialAttendeeIds,
  hasKnowledgeTopics,
}: EditActivityFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(activity.name)
  const [type, setType] = useState<ActivityType>(activity.type)
  const [date, setDate] = useState(toDateInputValue(activity.date))
  const [description, setDescription] = useState(activity.description ?? '')
  const [agendaItems, setAgendaItems] = useState<DraftItem[]>(
    activity.agendaItems.map((item) => ({
      id: item.id,
      kind: item.knowledgeTopicId ? 'topic' : 'text',
      text: item.text ?? '',
      knowledgeTopicId: item.knowledgeTopicId,
      topicName: item.knowledgeTopic?.name,
      tableName: item.knowledgeTopic?.knowledgeTable.name,
    }))
  )
  const [attendeeIds, setAttendeeIds] = useState<Set<string>>(() => new Set(initialAttendeeIds))

  function handleCancel() {
    router.push(`/activities/${activity.id}`)
  }

  function handleSave() {
    if (!name.trim() || !date) return
    setError(null)
    startTransition(async () => {
      const activityResult = await updateActivity({
        id: activity.id,
        name: name.trim(),
        type,
        date: new Date(date),
        description: description.trim() || undefined,
      })
      if (!activityResult.success) {
        setError(activityResult.error ?? 'Помилка збереження')
        return
      }

      const agendaResult = await saveAgenda({
        activityId: activity.id,
        items: agendaItems.map((item, i) => ({
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

      const attendanceResult = await setAttendance(activity.id, [...attendeeIds])
      if (!attendanceResult.success) {
        setError(attendanceResult.error ?? 'Помилка збереження відвідуваності')
        return
      }
      if (hasKnowledgeTopics) {
        await syncCoverageForActivity(activity.id)
      }

      router.push(`/activities/${activity.id}`)
    })
  }

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={handleCancel}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
        >
          {'← Скасувати'}
        </button>
        <div className="flex items-center gap-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !name.trim() || !date}
            className="bg-[#E85D04] hover:bg-[#F4845F] text-white text-xs rounded-[7px] min-w-[130px] h-9"
          >
            {isPending ? 'Збереження...' : 'Зберегти зміни'}
          </Button>
        </div>
      </div>

      {/* Basic info card */}
      <div className="bg-white border border-gray-100 rounded-[10px] p-6 space-y-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.8px]">
          {'Основна інформація'}
        </p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-xs text-gray-600">
              {'Назва'}
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">{'Тип'}</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger className="h-9">
                  <SelectValue>
                    {typeLabels[type]}
                  </SelectValue>
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
                {'Дата'}
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc" className="text-xs text-gray-600">
              {'Опис'}{' '}
              <span className="text-gray-400 font-normal">{'(необовʼязково)'}</span>
            </Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опис заходу..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* Agenda card */}
      <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-gray-800">{'Агенда'}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{agendaItems.length} {'пунктів'}</p>
          </div>
        </div>
        <div className="p-5">
          <AgendaEditor
            items={agendaItems}
            onItemsChange={setAgendaItems}
            availableTopics={availableTopics}
          />
        </div>
      </div>

      {/* Attendance card */}
      <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[13px] font-semibold text-gray-800">{'Відвідуваність'}</p>
        </div>
        <div className="p-5">
          <AttendanceTable
            activityId={activity.id}
            members={members}
            attendeeIds={attendeeIds}
            onAttendeeIdsChange={setAttendeeIds}
          />
        </div>
      </div>
    </div>
  )
}
