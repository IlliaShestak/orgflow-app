export default function TeamDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="text-gray-400 text-sm">Команда {params.id} — буде реалізовано</div>
  )
}
