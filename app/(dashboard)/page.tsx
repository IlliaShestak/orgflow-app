import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUpcomingActivities } from '@/modules/activities/repository/activityRepository'
import { ActivityTypeBadge } from '@/modules/activities/components/ActivityTypeBadge'

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const upcoming = await getUpcomingActivities()

  const userName = session.user.name ?? session.user.email ?? 'Користувач'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">
          {'Вітаємо, '}{userName}
        </h1>
        <p className="text-sm text-gray-400 mt-1">{'Огляд найближчих заходів організації'}</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-gray-800">{'Найближчі заходи'}</h2>
          <Link
            href="/activities"
            className="text-[11px] text-[#E85D04] hover:text-[#F4845F] transition-colors"
          >
            {'Всі заходи →'}
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            {'Найближчих заходів не заплановано'}
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcoming.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFBFD] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ActivityTypeBadge type={activity.type} />
                  <span className="text-[13px] font-medium text-gray-800">{activity.name}</span>
                </div>
                <span className="text-[12px] text-gray-400 whitespace-nowrap">
                  {new Date(activity.date).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
