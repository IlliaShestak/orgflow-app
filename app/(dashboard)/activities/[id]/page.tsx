export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="text-gray-400 text-sm">Захід {params.id} — буде реалізовано</div>
  )
}
