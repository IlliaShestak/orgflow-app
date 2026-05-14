'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveAgenda } from '../actions/activityActions'
import type { AgendaItem } from '../types'

interface KnowledgeTopic {
  id: string
  name: string
  knowledgeTable: { name: string }
}

interface AgendaEditorProps {
  activityId: string
  initialItems: AgendaItem[]
  availableTopics: KnowledgeTopic[]
}

type DraftItem = {
  id?: string
  kind: 'text' | 'topic'
  text: string
  knowledgeTopicId: string | null
}

export function AgendaEditor({ activityId, initialItems, availableTopics }: AgendaEditorProps) {
  const [items, setItems] = useState<DraftItem[]>(
    initialItems.map((item) => ({
      id: item.id,
      kind: item.knowledgeTopicId ? 'topic' : 'text',
      text: item.text ?? '',
      knowledgeTopicId: item.knowledgeTopicId,
    }))
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function addText() {
    setItems((prev) => [...prev, { kind: 'text', text: '', knowledgeTopicId: null }])
  }

  function addTopic() {
    setItems((prev) => [...prev, { kind: 'topic', text: '', knowledgeTopicId: null }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function moveUp(index: number) {
    if (index === 0) return
    setItems((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return
    setItems((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await saveAgenda({
        activityId,
        items: items.map((item, i) => ({
          id: item.id,
          order: i,
          text: item.kind === 'text' ? item.text : null,
          knowledgeTopicId: item.kind === 'topic' ? item.knowledgeTopicId : null,
        })),
      })
      if (result.success) {
        setSaved(true)
      } else {
        setError(result.error ?? 'Помилка')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Порядок денний порожній</p>
        )}
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 bg-[#F7F8FA] rounded-[8px] px-3 py-2">
            <span className="text-[11px] text-gray-400 w-5 shrink-0">{index + 1}</span>

            {item.kind === 'text' ? (
              <Input
                value={item.text}
                onChange={(e) => updateItem(index, { text: e.target.value })}
                placeholder="Текст пункту..."
                className="flex-1 h-8 text-sm"
              />
            ) : (
              <Select
                value={item.knowledgeTopicId ?? ''}
                onValueChange={(v) => updateItem(index, { knowledgeTopicId: v })}
              >
                <SelectTrigger className="flex-1 h-8 text-sm">
                  <SelectValue placeholder="Оберіть тему КСПЗ..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTopics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.knowledgeTable.name} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex gap-1 shrink-0">
              <button onClick={() => moveUp(index)} className="text-gray-400 hover:text-gray-600 text-xs px-1">↑</button>
              <button onClick={() => moveDown(index)} className="text-gray-400 hover:text-gray-600 text-xs px-1">↓</button>
              <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={addText} className="text-xs h-8">
          + Текст
        </Button>
        <Button type="button" variant="outline" onClick={addTopic} className="text-xs h-8">
          + Тема КСПЗ
        </Button>
        <div className="flex-1" />
        {saved && <span className="text-xs text-[#0B7B45] self-center">Збережено</span>}
        {error && <span className="text-xs text-red-500 self-center">{error}</span>}
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="bg-[#E85D04] hover:bg-[#F4845F] text-white text-xs rounded-[7px] h-8"
        >
          {isPending ? 'Збереження...' : 'Зберегти порядок денний'}
        </Button>
      </div>
    </div>
  )
}
