import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActivityById } from '@/modules/activities/repository/activityRepository'
import { ActivityTypeBadge } from '@/modules/activities/components/ActivityTypeBadge'
import { DeleteActivityButton } from '@/modules/activities/components/DeleteActivityButton'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { StateBadge } from '@/shared/components/StateBadge'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
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

  const statusCounts = {
    total: activity.attendance.length,
    Observer: activity.attendance.filter(a => a.member.status === 'Observer').length,
    Baby: activity.attendance.filter(a => a.member.status === 'Baby').length,
    Full: activity.attendance.filter(a => a.member.status === 'Full').length,
    Alumni: activity.attendance.filter(a => a.member.status === 'Alumni').length,
  }

  return (
    <div className="p-8 bg-[#F7F8FA] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-5">
        <Link
          href="/activities"
          className="text-xs text-gray-400 hover:text-gray-600 inline-block"
        >
          {'← Заходи'}
        </Link>

        {/* Header card */}
        <div className="bg-white border border-gray-100 rounded-[10px] p-6 flex items-start justify-between gap-4">
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
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/activities/${id}/edit`}
                className="inline-flex items-center justify-center h-9 px-4 text-[13px] font-medium rounded-[8px] border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors whitespace-nowrap"
              >
                {'Редагувати'}
              </Link>
              <DeleteActivityButton activityId={id} />
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white border border-gray-100 rounded-[10px] p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{'Всього'}</p>
            <p className="text-[28px] font-bold text-[#E85D04]">{statusCounts.total}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{'присутніх'}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[10px] p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{'Observer'}</p>
            <p className="text-[28px] font-bold text-[#0A3D91]">{statusCounts.Observer}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{'учасників'}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[10px] p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{'Baby'}</p>
            <p className="text-[28px] font-bold text-[#E85D04]">{statusCounts.Baby}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{'учасників'}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[10px] p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{'Full'}</p>
            <p className="text-[28px] font-bold text-[#0B7B45]">{statusCounts.Full}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{'учасників'}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[10px] p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{'Alumni'}</p>
            <p className="text-[28px] font-bold text-gray-500">{statusCounts.Alumni}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{'учасників'}</p>
          </div>
        </div>

        {/* Agenda card */}
        <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-800">{'Агенда'}</h2>
            <span className="text-[11px] text-gray-400">
              {activity.agendaItems.length === 0
                ? '(0 пунктів)'
                : `${activity.agendaItems.length} пунктів`}
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

        {/* Attendance card */}
        <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-800">{'Відвідуваність'}</h2>
            <span className="text-[11px] text-gray-400">
              {activity.attendance.length} {'присутніх'}
            </span>
          </div>
          {activity.attendance.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">{'Ніхто не відвідав захід'}</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {'Учасник'}
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {'Статус'}
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {'Стан'}
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {'Дата вступу'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {activity.attendance.map((a, i) => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar
                          firstName={a.member.firstName}
                          lastName={a.member.lastName}
                          size="sm"
                          colorIndex={i}
                        />
                        <span className="text-[13px] text-gray-800">
                          {a.member.lastName} {a.member.firstName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.member.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StateBadge state={a.member.state} />
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">
                      {new Date(a.member.joinedAt).toLocaleDateString('uk-UA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
