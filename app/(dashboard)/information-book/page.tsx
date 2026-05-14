import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getMembers, getMembersForMentorSelect } from '@/modules/hr/repository/memberRepository'
import { MemberTable } from '@/modules/hr/components/MemberTable'
import { MemberKanbanBoard } from '@/modules/hr/components/MemberKanbanBoard'
import { MemberFilters } from '@/modules/hr/components/MemberFilters'
import { AddMemberDialog } from '@/modules/hr/components/AddMemberDialog'
import { ViewToggle } from '@/modules/hr/components/ViewToggle'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { MemberStatus, MemberState } from '@/generated/prisma'

interface PageProps {
  searchParams: Promise<{ view?: string; search?: string; status?: string; state?: string }>
}

export default async function InformationBookPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const params = await searchParams
  const view = params.view === 'kanban' ? 'kanban' : 'table'
  const role = session.user.role

  const filters = {
    search: params.search,
    status: params.status as MemberStatus | undefined,
    state: params.state as MemberState | undefined,
  }

  const [members, mentors] = await Promise.all([
    getMembers(filters),
    getMembersForMentorSelect(),
  ])

  const canAdd = role === 'Admin' || role === 'VP4HR'

  // Stats
  const counts = {
    Observer: members.filter((m) => m.status === 'Observer').length,
    Baby: members.filter((m) => m.status === 'Baby').length,
    Full: members.filter((m) => m.status === 'Full').length,
    Alumni: members.filter((m) => m.status === 'Alumni').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold tracking-[-0.3px] text-gray-900">Information book</h1>
        <div className="flex items-center gap-3">
          <ViewToggle currentView={view} />
          {canAdd && <AddMemberDialog mentors={mentors} />}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-[10px] border-t-[3px] border-[#0A3D91] p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-gray-400">Observer</p>
          <p className="text-[32px] font-bold tracking-[-1px] text-[#0A3D91]">{counts.Observer}</p>
        </div>
        <div className="bg-white rounded-[10px] border-t-[3px] border-[#E85D04] p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-gray-400">Baby</p>
          <p className="text-[32px] font-bold tracking-[-1px] text-[#E85D04]">{counts.Baby}</p>
        </div>
        <div className="bg-white rounded-[10px] border-t-[3px] border-[#0B7B45] p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-gray-400">Full</p>
          <p className="text-[32px] font-bold tracking-[-1px] text-[#0B7B45]">{counts.Full}</p>
        </div>
        <div className="bg-white rounded-[10px] border-t-[3px] border-gray-400 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-gray-400">Alumni</p>
          <p className="text-[32px] font-bold tracking-[-1px] text-gray-400">{counts.Alumni}</p>
        </div>
      </div>

      {/* Filters */}
      <Suspense>
        <MemberFilters />
      </Suspense>

      {/* Content */}
      <Suspense fallback={<LoadingSpinner />}>
        {members.length === 0 ? (
          <EmptyState
            title="Учасників не знайдено"
            description="Спробуйте змінити фільтри або додайте нового учасника"
            action={canAdd ? <AddMemberDialog mentors={mentors} /> : undefined}
          />
        ) : view === 'kanban' ? (
          <MemberKanbanBoard members={members} />
        ) : (
          <MemberTable members={members} />
        )}
      </Suspense>
    </div>
  )
}
