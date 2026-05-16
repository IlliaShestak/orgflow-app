import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getActivityById } from '@/modules/activities/repository/activityRepository'
import { EditActivityForm } from '@/modules/activities/components/EditActivityForm'
import { getSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Role } from '@prisma/client'

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [activity, session] = await Promise.all([getActivityById(id), getSession()])

  if (!activity) notFound()

  const role = session?.user?.role as Role | undefined
  if (role !== Role.Admin && role !== Role.VP4HR) {
    redirect(`/activities/${id}`)
  }

  const [allTopics, allMembers] = await Promise.all([
    prisma.knowledgeTopic.findMany({
      select: { id: true, name: true, knowledgeTable: { select: { name: true } } },
      orderBy: [{ knowledgeTable: { name: 'asc' } }, { order: 'asc' }],
    }),
    prisma.member.findMany({
      select: { id: true, firstName: true, lastName: true, status: true, state: true, joinedAt: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
  ])

  const initialAttendeeIds = activity.attendance.map((a) => a.memberId)
  const hasKnowledgeTopics = activity.agendaItems.some((item) => item.knowledgeTopicId !== null)

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/activities/${id}`}
          className="text-xs text-gray-400 hover:text-gray-600 mb-5 inline-block"
        >
          {'← Назад до заходу'}
        </Link>
        <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900 mb-6">
          {'Редагування заходу'}
        </h1>
        <EditActivityForm
          activity={activity as Parameters<typeof EditActivityForm>[0]['activity']}
          availableTopics={allTopics}
          members={allMembers}
          initialAttendeeIds={initialAttendeeIds}
          hasKnowledgeTopics={hasKnowledgeTopics}
        />
      </div>
    </div>
  )
}
