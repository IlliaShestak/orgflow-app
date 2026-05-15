import { getActivities } from '@/modules/activities/repository/activityRepository'
import { ActivityTypeBadge } from '@/modules/activities/components/ActivityTypeBadge'
import { AddActivityDialog } from '@/modules/activities/components/AddActivityDialog'
import { getSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import Link from 'next/link'
import { Role, ActivityType } from '@prisma/client'

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string }>
}) {
  const session = await getSession()
  const role = session?.user?.role as Role | undefined
  const canCreate = role === Role.Admin || role === Role.VP4HR

  const { type, search } = await searchParams
  const typeFilter = type as ActivityType | undefined
  const activities = await getActivities({ type: typeFilter, search })

  let dialogTopics: { id: string; name: string; knowledgeTable: { name: string } }[] = []
  let dialogMembers: { id: string; firstName: string; lastName: string }[] = []

  if (canCreate) {
    ;[dialogTopics, dialogMembers] = await Promise.all([
      prisma.knowledgeTopic.findMany({
        select: { id: true, name: true, knowledgeTable: { select: { name: true } } },
        orderBy: [{ knowledgeTable: { name: 'asc' } }, { order: 'asc' }],
      }),
      prisma.member.findMany({
        select: { id: true, firstName: true, lastName: true },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
    ])
  }

  const typeLabels: Record<string, string> = {
    Gathering: 'Gathering',
    SIT: 'SIT',
    LeisureEvent: 'Leisure Event',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">{'Заходи'}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{activities.length} заходів</p>
        </div>
        {canCreate && (
          <AddActivityDialog availableTopics={dialogTopics} availableMembers={dialogMembers} />
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        <Link
          href="/activities"
          className={`px-3 py-1.5 rounded-[7px] text-xs font-medium transition-colors ${
            !typeFilter
              ? 'bg-[#1A1D2E] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-[#E85D04] hover:text-[#E85D04]'
          }`}
        >
          {'Всі'}
        </Link>
        {Object.entries(typeLabels).map(([val, label]) => (
          <Link
            key={val}
            href={`/activities?type=${val}`}
            className={`px-3 py-1.5 rounded-[7px] text-xs font-medium transition-colors ${
              typeFilter === val
                ? 'bg-[#1A1D2E] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#E85D04] hover:text-[#E85D04]'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* List */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-gray-300 text-2xl">{'📅'}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">{'Заходів немає'}</p>
          <p className="text-xs text-gray-400 mt-1">
            {canCreate ? 'Додайте перший захід' : 'Заходи ще не заплановані'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F8FA]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  {'Назва'}
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  {'Тип'}
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  {'Дата'}
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  {'Присутніх'}
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  {'Пунктів'}
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-t border-gray-100 hover:bg-[#FAFBFD] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/activities/${activity.id}`}
                      className="text-sm font-medium text-gray-800 hover:text-[#E85D04]"
                    >
                      {activity.name}
                    </Link>
                    {activity.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {activity.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ActivityTypeBadge type={activity.type} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(activity.date).toLocaleDateString('uk-UA')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {activity._count.attendance}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {activity._count.agendaItems}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
