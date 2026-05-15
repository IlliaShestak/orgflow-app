import { notFound } from 'next/navigation'
import { getActivityById } from '@/modules/activities/repository/activityRepository'
import { AgendaEditor } from '@/modules/activities/components/AgendaEditor'
import { AttendancePanel } from '@/modules/activities/components/AttendancePanel'
import { ActivityTypeBadge } from '@/modules/activities/components/ActivityTypeBadge'
import { getSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import Link from 'next/link'
import { Role } from '@prisma/client'

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
  const [activity, session] = await Promise.all([
    getActivityById(params.id),
    getSession(),
  ])

  if (!activity) notFound()

  const role = session?.user?.role as Role | undefined
  const canEdit = role === Role.Admin || role === Role.VP4HR

  // Get all knowledge topics for agenda editor
  const allTopics = await prisma.knowledgeTopic.findMany({
    select: {
      id: true,
      name: true,
      knowledgeTable: { select: { name: true } },
    },
    orderBy: [{ knowledgeTable: { name: 'asc' } }, { order: 'asc' }],
  })

  // Get members for attendance — role-scoped
  let availableMembers: { id: string; firstName: string; lastName: string }[] = []
  if (role === Role.FullMember && session?.user?.id) {
    const self = await prisma.member.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        mentees: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    if (self) {
      availableMembers = [
        { id: self.id, firstName: self.firstName, lastName: self.lastName },
        ...self.mentees,
      ]
    }
  } else if (canEdit) {
    availableMembers = await prisma.member.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Back link */}
      <Link href="/activities" className="text-xs text-gray-400 hover:text-gray-600 mb-4 inline-block">
        ← Заходи
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ActivityTypeBadge type={activity.type} />
            <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">
              {new Date(activity.date).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h1>
          </div>
          <p className="text-sm text-gray-600">{activity.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda */}
        <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-800">Порядок денний</h2>
            <span className="text-[11px] text-gray-400">{activity.agendaItems.length} пунктів</span>
          </div>
          <div className="p-4">
            {canEdit ? (
              <AgendaEditor
                activityId={activity.id}
                initialItems={activity.agendaItems}
                availableTopics={allTopics}
              />
            ) : (
              <div className="space-y-2">
                {activity.agendaItems.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Порядок денний порожній</p>
                ) : (
                  activity.agendaItems.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] rounded-[8px]">
                      <span className="text-[11px] text-gray-400 w-5">{i + 1}</span>
                      {item.knowledgeTopic ? (
                        <span className="text-sm text-gray-700">
                          <span className="text-[11px] text-[#0B7B45] font-medium mr-1">[КСПЗ]</span>
                          {item.knowledgeTopic.knowledgeTable.name} — {item.knowledgeTopic.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-700">{item.text}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white border border-gray-100 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-800">Відвідуваність</h2>
            <span className="text-[11px] text-gray-400">{activity.attendance.length} присутніх</span>
          </div>
          <div className="p-4">
            <AttendancePanel
              activityId={activity.id}
              attendance={activity.attendance}
              availableMembers={availableMembers}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
