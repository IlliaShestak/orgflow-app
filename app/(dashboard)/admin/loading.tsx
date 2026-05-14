export default function Loading() {
  return (
    <div className="p-7 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-36" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-[10px] p-5 space-y-3">
          <div className="h-5 bg-gray-100 rounded w-32" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-9 bg-gray-100 rounded w-28" />
        </div>
        <div className="bg-white border border-gray-100 rounded-[10px] p-5 space-y-3">
          <div className="h-5 bg-gray-100 rounded w-28" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-9 bg-gray-100 rounded w-28" />
        </div>
      </div>
    </div>
  )
}
