export default function Loading() {
  return (
    <div className="p-7 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-4 bg-gray-100 rounded w-4" />
        <div className="h-4 bg-gray-100 rounded w-28" />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-gray-100 rounded w-48" />
          <div className="h-5 bg-gray-100 rounded w-20" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-gray-100 rounded w-28" />
          <div className="h-9 bg-gray-100 rounded w-24" />
        </div>
      </div>
      <div className="h-px bg-gray-100 rounded" />
      <div className="h-6 bg-gray-100 rounded w-32" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-white border border-gray-100 rounded-[10px] p-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-100 rounded w-36" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
