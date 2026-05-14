import { cn } from '@/shared/lib/utils'

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#E85D04] rounded-full animate-spin" />
    </div>
  )
}
