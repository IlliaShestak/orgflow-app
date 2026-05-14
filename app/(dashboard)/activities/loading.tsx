export default function Loading() {
  return (
    <div className="p-7 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-100 rounded w-32" />
        <div className="h-9 bg-gray-100 rounded w-32" />
      </div>
      <div className="flex gap-3">
        <div className="h-9 bg-gray-100 rounded w-48" />
        <div className="h-9 bg-gray-100 rounded w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[10px] p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-48" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
            <div className="h-6 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
