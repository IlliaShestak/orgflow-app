import { getActivities } from '@/modules/activities/repository/activityRepository'
import { ActivityTypeBadge } from '@/modules/activities/components/ActivityTypeBadge'
import { AddActivityDialog } from '@/modules/activities/components/AddActivityDialog'
import { getSession } from '@/shared/lib/auth'
import Link from 'next/link'
import { Role, ActivityType } from '@prisma/client'

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: { type?: string; search?: string }
}) {
  const session = await getSession()
  const role = session?.user?.role as Role | undefined
  const canCreate = role === Role.Admin || role === Role.VP4HR

  const typeFilter = searchParams.type as ActivityType | undefined
  const activities = await getActivities({
    type: typeFilter,
    search: searchParams.search,
  })

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
          <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">Р—Р°С…РѕРґРё</h1>
          <p className="text-xs text-gray-400 mt-0.5">{activities.length} Р·Р°С…РѕРґС–РІ</p>
        </div>
        {canCreate && <AddActivityDialog />}
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
          Р’СЃС–
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

      {/* Table */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-gray-300 text-2xl">рџ“…</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Р—Р°С…РѕРґС–РІ РЅРµРјР°С”</p>
          <p className="text-xs text-gray-400 mt-1">
            {canCreate ? 'Р”РѕРґР°Р№С‚Рµ РїРµСЂС€РёР№ Р·Р°С…С–Рґ' : 'Р—Р°С…РѕРґРё С‰Рµ РЅРµ Р·Р°РїР»Р°РЅРѕРІР°РЅС–'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F8FA]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  Р”Р°С‚Р°
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  РўРёРї
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  РћРїРёСЃ
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  РџСЂРёСЃСѓС‚РЅС–С…
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400">
                  РџСѓРЅРєС‚С–РІ
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
                    <Link href={`/activities/${activity.id}`} className="text-sm text-gray-800 hover:text-[#E85D04]">
                      {new Date(activity.date).toLocaleDateString('uk-UA')}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <ActivityTypeBadge type={activity.type} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/activities/${activity.id}`} className="text-sm text-gray-700 hover:text-[#E85D04] line-clamp-1">
                      {activity.description}
                    </Link>
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
