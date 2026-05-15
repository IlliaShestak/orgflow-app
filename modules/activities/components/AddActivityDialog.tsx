'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ActivityType } from '@/generated/prisma'
import { createActivity } from '../actions/activityActions'

const typeLabels: Record<ActivityType, string> = {
  Gathering: 'Gathering',
  SIT: 'SIT',
  LeisureEvent: 'Leisure Event',
}

export function AddActivityDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const type = fd.get('type') as ActivityType
    const date = fd.get('date') as string
    const description = fd.get('description') as string

    setError(null)
    startTransition(async () => {
      const result = await createActivity({ type, date: new Date(date), description })
      if (result.success) {
        setOpen(false)
      } else {
        setError(result.error ?? 'Помилка')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-[#E85D04] hover:bg-[#F4845F] text-white rounded-[7px] px-[14px] py-[7px] text-xs font-semibold h-auto" />
        }
      >
        {'+ Додати захід'}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{'Новий захід'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="type">{'Тип заходу'}</Label>
            <Select name="type" required>
              <SelectTrigger id="type">
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
          <div className="space-y-1.5">
            <Label htmlFor="description">{'Опис'}</Label>
            <Textarea id="description" name="description" placeholder="Опис заходу..." required rows={3} />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-xs">
              {'Скасувати'}
            </Button>
            <Button type="submit" disabled={isPending}
              className="bg-[#E85D04] hover:bg-[#F4845F] text-white text-xs rounded-[7px]">
              {isPending ? 'Збереження...' : 'Зберегти'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
