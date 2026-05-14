export default function Loading() {
  return (
    <div className="p-7 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-9 bg-gray-100 rounded w-36" />
      </div>
      <div className="flex gap-3">
        <div className="h-9 bg-gray-100 rounded w-64" />
        <div className="h-9 bg-gray-100 rounded w-32" />
        <div className="h-9 bg-gray-100 rounded w-32" />
      </div>
      <div className="h-px bg-gray-100 rounded" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-4 bg-gray-100 rounded flex-1" />
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-4 bg-gray-100 rounded w-20" />
          <div className="h-6 bg-gray-100 rounded w-16" />
        </div>
      ))}
    </div>
  )
}
