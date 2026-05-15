import { cn } from '@/shared/lib/utils'
import { MemberState } from '@prisma/client'

interface StateBadgeProps {
  state: MemberState
  className?: string
}

export function StateBadge({ state, className }: StateBadgeProps) {
  const isActive = state === 'Active'
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isActive ? 'bg-[#0B7B45]' : 'bg-gray-400'
        )}
      />
      <span className="text-[12px] font-medium text-[#5A6080]">
        {isActive ? 'Активний' : 'Неактивний'}
      </span>
    </span>
  )
}
