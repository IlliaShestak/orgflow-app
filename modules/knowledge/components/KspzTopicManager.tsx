'use client'

import { useState, useTransition } from 'react'
import { createKspzTopic, deleteKspzTopic, updateKspzTopic } from '../actions/kspzActions'
import type { KspzTopic } from '../types'

interface KspzTopicManagerProps {
  tableId: string
  topics: KspzTopic[]
}

export function KspzTopicManager({ tableId, topics }: KspzTopicManagerProps) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    if (!newName.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await createKspzTopic({ knowledgeTableId: tableId, name: newName.trim() })
      if (result.success) {
        setNewName('')
      } else {
        setError(result.error ?? 'Помилка')
      }
    })
  }

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteKspzTopic(id)
      if (!result.success) setError(result.error ?? 'Помилка')
    })
  }

  function startEdit(topic: KspzTopic) {
    setEditingId(topic.id)
    setEditName(topic.name)
  }

  function handleSaveEdit(id: string) {
    if (!editName.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await updateKspzTopic({ id, name: editName.trim() })
      if (result.success) {
        setEditingId(null)
      } else {
        setError(result.error ?? 'Помилка')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {topics.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3">Тем ще немає</p>
        )}
        {topics.map((topic, i) => (
          <div key={topic.id} className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] rounded-[8px]">
            <span className="text-[11px] text-gray-400 w-5">{i + 1}</span>
            {editingId === topic.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                  className="flex-1 h-7 text-sm border border-gray-200 rounded-[5px] px-2 focus:outline-none focus:border-[#E85D04]"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(topic.id)}
                  disabled={isPending}
                  className="h-7 px-2 text-xs bg-[#E85D04] hover:bg-[#F4845F] text-white rounded-[5px] transition-colors disabled:opacity-50"
                >
                  ✓
                </button>
                <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs px-1 hover:text-gray-600">✕</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-800">{topic.name}</span>
                <button onClick={() => startEdit(topic)} className="text-gray-400 hover:text-gray-600 text-xs px-1">✎</button>
                <button onClick={() => handleDelete(topic.id)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
          placeholder="Нова тема..."
          className="flex-1 h-8 text-sm border border-gray-200 rounded-[7px] px-3 focus:outline-none focus:border-[#E85D04] transition-colors"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !newName.trim()}
          className="bg-[#E85D04] hover:bg-[#F4845F] text-white text-xs rounded-[7px] h-8 px-3 shrink-0 transition-colors disabled:opacity-50"
        >
          Додати
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
