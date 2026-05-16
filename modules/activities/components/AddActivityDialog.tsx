'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ActivityType } from '@prisma/client'
import { createActivity } from '../actions/activityActions'

const typeLabels: Record<ActivityType, string> = {
  Gathering: 'Gathering',
  SIT: 'SIT',
  LeisureEvent: 'Leisure Event',
  ThursdayMeeting: 'Четвергові збори',
}

export function AddActivityDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [type, setType] = useState<ActivityType | ''>('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')

  function resetForm() {
    setName('')
    setType('')
    setDate('')
    setDescription('')
    setError(null)
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) resetForm()
  }

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
        agendaItems: [],
        memberIds: [],
      })
      if (result.success && result.data) {
        handleOpenChange(false)
        router.push(`/activities/${result.data.id}/edit`)
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

      <DialogContent className="max-w-[480px] sm:max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-base">{'Новий захід'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-5 space-y-4">
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
                    <SelectValue>
                      {type ? typeLabels[type as ActivityType] : 'Оберіть тип'}
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

          <div className="border-t border-gray-100 px-6 py-4 bg-white flex items-center justify-between gap-3">
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
