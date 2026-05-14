import { cn } from '@/shared/lib/utils'
import { getInitials } from '@/shared/lib/utils'

const colors = [
  'bg-[#0A3D91] text-white',
  'bg-[#E85D04] text-white',
  'bg-[#0B7B45] text-white',
]

interface MemberAvatarProps {
  firstName: string
  lastName: string
  size?: 'sm' | 'md' | 'lg'
  colorIndex?: number
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-[34px] h-[34px] text-[12px]',
  lg: 'w-10 h-10 text-[13px]',
}

export function MemberAvatar({
  firstName,
  lastName,
  size = 'md',
  colorIndex = 0,
  className,
}: MemberAvatarProps) {
  const color = colors[colorIndex % colors.length]
  const initials = getInitials(firstName, lastName)

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
        sizeClasses[size],
        color,
        className
      )}
    >
      {initials}
    </div>
  )
}
