export default function Loading() {
  return (
    <div className="p-7 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-4 bg-gray-100 rounded w-4" />
        <div className="h-4 bg-gray-100 rounded w-28" />
      </div>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-gray-100 rounded w-56" />
          <div className="flex gap-3">
            <div className="h-5 bg-gray-100 rounded w-20" />
            <div className="h-5 bg-gray-100 rounded w-28" />
          </div>
        </div>
        <div className="h-9 bg-gray-100 rounded w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-gray-100 rounded w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-100 rounded w-28" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-100 rounded" />
              <div className="h-4 bg-gray-100 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
