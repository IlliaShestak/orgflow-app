import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-gray-500">Сторінку не знайдено</p>
      <Link
        href="/information-book"
        className="px-4 py-2 bg-brand-blue text-white rounded-md text-sm"
      >
        На головну
      </Link>
    </div>
  )
}
