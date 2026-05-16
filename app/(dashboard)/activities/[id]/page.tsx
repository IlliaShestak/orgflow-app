import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActivityById } from '@/modules/activities/repository/activityRepository'
import { ActivityTypeBadge } from '@/modules/activities/components/ActivityTypeBadge'
import { getSession } from '@/shared/lib/auth'
import { Role } from '@prisma/client'

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [activity, session] = await Promise.all([getActivityById(id), getSession()])

  if (!activity) notFound()

  const role = session?.user?.role as Role | undefined
  const canEdit = role === Role.Admin || role === Role.VP4HR

  const formattedDate = new Date(activity.date).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/activities"
          className="text-xs text-gray-400 hover:text-gray-600 mb-4 inline-block"
        >
          {'← Заходи'}
        </Link>

        {/* Outer card */}
        <div className="bg-white border border-gray-100 rounded-[14px] overflow-hidden shadow-sm">

          {/* Activity header */}
          <div className="px-7 py-6 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <ActivityTypeBadge type={activity.type} />
                <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">
                  {activity.name}
                </h1>
              </div>
              <p className="text-sm text-gray-400">{formattedDate}</p>
              {activity.description && (
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              )}
            </div>
            {canEdit && (
              <Link
                href={`/activities/${id}/edit`}
                className="inline-flex items-center justify-center shrink-0 text-xs h-8 px-3 rounded-[7px] border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors whitespace-nowrap"
              >
                {'Редагувати'}
              </Link>
            )}
          </div>

          {/* Inner cards grid on off-white background */}
          <div className="bg-[#F7F8FA] p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Agenda */}
            <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-gray-800">{'Агенда'}</h2>
                <span className="text-[11px] text-gray-400">
                  {activity.agendaItems.length} {'пунктів'}
                </span>
              </div>
              <div className="p-4">
                {activity.agendaItems.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">{'Агенда порожня'}</p>
                ) : (
                  <div className="space-y-2">
                    {activity.agendaItems.map((item, i) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] rounded-[8px]"
                      >
                        <span className="text-[11px] text-gray-400 w-5 shrink-0">{i + 1}</span>
                        {item.knowledgeTopic ? (
                          <span className="text-sm text-gray-700">
                            <span className="text-[11px] text-[#0B7B45] font-medium mr-1">
                              {'[КСПЗ]'}
                            </span>
                            {item.knowledgeTopic.knowledgeTable.name} — {item.knowledgeTopic.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-700">{item.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Attendance (read-only) */}
            <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-gray-800">{'Відвідуваність'}</h2>
                <span className="text-[11px] text-gray-400">
                  {activity.attendance.length} {'присутніх'}
                </span>
              </div>
              <div className="p-4">
                {activity.attendance.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">{'Ніхто не відвідав'}</p>
                ) : (
                  <div className="space-y-1.5">
                    {activity.attendance.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] rounded-[8px]"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#E85D04] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                          {a.member.firstName[0]}
                          {a.member.lastName[0]}
                        </div>
                        <span className="text-sm text-gray-800">
                          {a.member.lastName} {a.member.firstName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
