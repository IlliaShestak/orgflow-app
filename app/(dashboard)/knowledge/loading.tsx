export default function Loading() {
  return (
    <div className="p-7 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-100 rounded w-20" />
        <div className="h-9 bg-gray-100 rounded w-36" />
      </div>
      <div className="flex gap-4 border-b border-gray-100 pb-0">
        <div className="h-9 bg-gray-100 rounded w-36" />
        <div className="h-9 bg-gray-100 rounded w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[10px] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-100 rounded w-36" />
              <div className="h-5 bg-gray-100 rounded w-16" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-5 bg-gray-100 rounded w-16" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
