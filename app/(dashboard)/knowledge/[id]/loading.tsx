export default function Loading() {
  return (
    <div className="p-7 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-4 bg-gray-100 rounded w-4" />
        <div className="h-4 bg-gray-100 rounded w-20" />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-gray-100 rounded w-52" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-gray-100 rounded w-28" />
          <div className="h-9 bg-gray-100 rounded w-24" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-max space-y-2">
          <div className="flex gap-2">
            <div className="h-8 bg-gray-100 rounded w-40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded w-28" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="h-10 bg-gray-100 rounded w-40" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-10 bg-gray-100 rounded w-28" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
