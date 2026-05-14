import { cn } from '@/shared/lib/utils'
import { MemberStatus } from '../../generated/prisma'

const statusConfig: Record<MemberStatus, { label: string; className: string }> = {
  Observer: { label: 'Observer', className: 'bg-[#E8EDF8] text-[#0A3D91]' },
  Baby: { label: 'Baby', className: 'bg-[#FDF0E8] text-[#E85D04]' },
  Full: { label: 'Full', className: 'bg-[#E6F5EE] text-[#0B7B45]' },
  Alumni: { label: 'Alumni', className: 'bg-gray-100 text-gray-500' },
}

interface StatusBadgeProps {
  status: MemberStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
