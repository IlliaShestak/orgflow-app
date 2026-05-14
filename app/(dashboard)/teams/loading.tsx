export default function Loading() {
  return (
    <div className="p-7 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-100 rounded w-36" />
        <div className="h-9 bg-gray-100 rounded w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[10px] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-100 rounded w-32" />
              <div className="h-5 bg-gray-100 rounded w-16" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-px bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
