'use client'

import { useState, useTransition } from 'react'
import { createKspzTopic, deleteKspzTopic, updateKspzTopic } from '../actions/kspzActions'
import type { KspzTopic, KspzTableColumn } from '../types'

interface KspzTopicManagerProps {
  tableId: string
  topics: KspzTopic[]
  tableColumns: KspzTableColumn[]
}

export function KspzTopicManager({ tableId, topics, tableColumns }: KspzTopicManagerProps) {
  const allTypeIds = tableColumns.map((c) => c.knowledgeTransferTypeId)

  const [newName, setNewName] = useState('')
  const [newTransferTypeIds, setNewTransferTypeIds] = useState<string[]>(allTypeIds)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTransferTypeIds, setEditTransferTypeIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const colNameMap = new Map(tableColumns.map((c) => [c.knowledgeTransferTypeId, c.knowledgeTransferType.name]))

  function toggleNewType(id: string) {
    setNewTransferTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleEditType(id: string) {
    setEditTransferTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleAdd() {
    if (!newName.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await createKspzTopic({
        knowledgeTableId: tableId,
        name: newName.trim(),
        transferTypeIds: newTransferTypeIds,
      })
      if (result.success) {
        setNewName('')
        setNewTransferTypeIds(allTypeIds)
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
    setEditTransferTypeIds(topic.transferTypes.map((tt) => tt.knowledgeTransferTypeId))
  }

  function handleSaveEdit(id: string) {
    if (!editName.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await updateKspzTopic({ id, name: editName.trim(), transferTypeIds: editTransferTypeIds })
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
          <div key={topic.id} className="px-3 py-2 bg-[#F7F8FA] rounded-[8px]">
            {editingId === topic.id ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 w-5 shrink-0">{i + 1}</span>
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
                </div>
                <div className="flex flex-wrap gap-2 pl-6">
                  {tableColumns.map((col) => (
                    <label key={col.knowledgeTransferTypeId} className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editTransferTypeIds.includes(col.knowledgeTransferTypeId)}
                        onChange={() => toggleEditType(col.knowledgeTransferTypeId)}
                        className="accent-[#E85D04] w-3 h-3"
                      />
                      <span className="text-[11px] text-gray-600">{col.knowledgeTransferType.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 w-5 shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-800">{topic.name}</span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {topic.transferTypes.length === 0 ? (
                    <span className="text-[10px] text-gray-400">—</span>
                  ) : (
                    topic.transferTypes.map((tt) => (
                      <span
                        key={tt.knowledgeTransferTypeId}
                        className="text-[10px] px-1.5 py-0.5 bg-[#E6F5EE] text-[#0B7B45] rounded-[3px] font-medium"
                      >
                        {colNameMap.get(tt.knowledgeTransferTypeId)}
                      </span>
                    ))
                  )}
                </div>
                <button onClick={() => startEdit(topic)} className="text-gray-400 hover:text-gray-600 text-xs px-1 shrink-0">✎</button>
                <button onClick={() => handleDelete(topic.id)} className="text-red-400 hover:text-red-600 text-xs px-1 shrink-0">✕</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new topic */}
      <div className="space-y-2 pt-1">
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
        <div className="flex flex-wrap gap-3">
          {tableColumns.map((col) => (
            <label key={col.knowledgeTransferTypeId} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newTransferTypeIds.includes(col.knowledgeTransferTypeId)}
                onChange={() => toggleNewType(col.knowledgeTransferTypeId)}
                className="accent-[#E85D04] w-3 h-3"
              />
              <span className="text-[11px] text-gray-600">{col.knowledgeTransferType.name}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
