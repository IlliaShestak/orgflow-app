'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface KnowledgeTopic {
  id: string
  name: string
  knowledgeTable: { name: string }
}

export interface DraftItem {
  id?: string
  kind: 'text' | 'topic'
  text: string
  knowledgeTopicId: string | null
  topicName?: string
  tableName?: string
}

interface AgendaEditorProps {
  items: DraftItem[]
  onItemsChange: (items: DraftItem[]) => void
  availableTopics: KnowledgeTopic[]
}

export function AgendaEditor({ items, onItemsChange, availableTopics }: AgendaEditorProps) {
  const [newTextItem, setNewTextItem] = useState('')
  const [topicSearch, setTopicSearch] = useState('')
  const [selectedTable, setSelectedTable] = useState('')

  const addedTopicIds = new Set(
    items.filter((i) => i.kind === 'topic').map((i) => i.knowledgeTopicId!)
  )

  const tables = [...new Set(availableTopics.map((t) => t.knowledgeTable.name))].sort()

  const filteredTopics = availableTopics.filter((t) => {
    if (addedTopicIds.has(t.id)) return false
    if (selectedTable && t.knowledgeTable.name !== selectedTable) return false
    const q = topicSearch.toLowerCase()
    if (!q) return true
    return t.name.toLowerCase().includes(q) || t.knowledgeTable.name.toLowerCase().includes(q)
  })

  function removeItem(index: number) {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  function moveUp(index: number) {
    if (index === 0) return
    const next = [...items]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onItemsChange(next)
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return
    const next = [...items]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    onItemsChange(next)
  }

  function addTextItem() {
    const text = newTextItem.trim()
    if (!text) return
    onItemsChange([...items, { kind: 'text', text, knowledgeTopicId: null }])
    setNewTextItem('')
  }

  function addTopicItem(topic: KnowledgeTopic) {
    onItemsChange([
      ...items,
      {
        kind: 'topic',
        text: '',
        knowledgeTopicId: topic.id,
        topicName: topic.name,
        tableName: topic.knowledgeTable.name,
      },
    ])
  }

  return (
    <div className="space-y-3">
      {/* Items list */}
      <div className="space-y-1.5">
        {items.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3">Агенда порожня</p>
        )}
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-[#F7F8FA] rounded-[8px] px-3 py-2"
          >
            <span className="text-[11px] text-gray-400 w-5 shrink-0">{index + 1}</span>
            <div className="flex-1 min-w-0">
              {item.kind === 'topic' ? (
                <span className="text-sm text-gray-700">
                  <span className="text-[11px] text-[#0B7B45] font-medium mr-1">[КСПЗ]</span>
                  {item.tableName} — {item.topicName}
                </span>
              ) : (
                <span className="text-sm text-gray-700 truncate block">{item.text}</span>
              )}
            </div>
            <div className="flex gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-25 text-xs w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-25 text-xs w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-gray-300 hover:text-red-500 text-xs w-6 h-6 flex items-center justify-center rounded hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

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
          placeholder="Новий текстовий пункт агенди..."
          className="flex-1 h-8 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addTextItem}
          disabled={!newTextItem.trim()}
          className="text-xs h-8 shrink-0"
        >
          Додати
        </Button>
      </div>

      {/* Topic picker */}
      {availableTopics.length > 0 && (
        <div className="border border-gray-100 rounded-[8px] overflow-hidden">
          <div className="px-3 py-2 bg-[#F7F8FA] border-b border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.6px]">
              Додати тему КСПЗ
            </p>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex gap-2">
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="h-8 text-xs border border-gray-200 rounded-[6px] px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#E85D04] min-w-[130px]"
              >
                <option value="">Усі таблиці</option>
                {tables.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <Input
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Пошук теми..."
                className="flex-1 h-8 text-sm"
              />
            </div>
            <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-[6px]">
              {filteredTopics.length === 0 ? (
                <p className="px-3 py-3 text-xs text-gray-400 text-center">
                  {addedTopicIds.size === availableTopics.length
                    ? 'Всі теми вже додано'
                    : 'Теми не знайдено'}
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
                    <span className="text-gray-400 mx-1">—</span>
                    {t.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
