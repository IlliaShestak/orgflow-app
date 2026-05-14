export default function Loading() {
  return (
    <div className="p-7 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-4 bg-gray-100 rounded w-4" />
        <div className="h-4 bg-gray-100 rounded w-32" />
      </div>
      <div className="flex gap-6 items-start">
        <div className="w-20 h-20 bg-gray-100 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-7 bg-gray-100 rounded w-48" />
          <div className="h-5 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-9 bg-gray-100 rounded w-24" />
      </div>
      <div className="flex gap-4 border-b border-gray-100 pb-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 bg-gray-100 rounded w-36" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-5 bg-gray-100 rounded w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}
