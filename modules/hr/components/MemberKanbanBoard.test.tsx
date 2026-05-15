import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/shared/components/MemberAvatar', () => ({
  MemberAvatar: ({ firstName, lastName }: { firstName: string; lastName: string }) => (
    <span data-testid="avatar">{firstName[0]}{lastName[0]}</span>
  ),
}))

vi.mock('@/shared/components/StateBadge', () => ({
  StateBadge: ({ state }: { state: string }) => (
    <span data-testid="state-badge">{state}</span>
  ),
}))

import { MemberKanbanBoard } from './MemberKanbanBoard'
import type { MemberListItem } from '../types'

function makeMembers(overrides: Partial<MemberListItem>[]): MemberListItem[] {
  return overrides.map((o, i) => ({
    id: `mem-${i}`,
    firstName: `First${i}`,
    lastName: `Last${i}`,
    status: 'Observer' as const,
    state: 'Active' as const,
    joinedAt: new Date(),
    email: null,
    telegram: null,
    mentor: null,
    userId: null,
    ...o,
  }))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MemberKanbanBoard', () => {
  it('renders all four status column headers when members list is empty', () => {
    render(<MemberKanbanBoard members={[]} />)

    expect(screen.getByText('Observer')).toBeTruthy()
    expect(screen.getByText('Baby')).toBeTruthy()
    expect(screen.getByText('Full')).toBeTruthy()
    expect(screen.getByText('Alumni')).toBeTruthy()
  })

  it('shows empty-state message in each column when no members', () => {
    render(<MemberKanbanBoard members={[]} />)

    const emptyMessages = screen.getAllByText('Немає учасників')
    expect(emptyMessages).toHaveLength(4)
  })

  it('places members in the correct column by status', () => {
    const members = makeMembers([
      { status: 'Observer', firstName: 'Alice', lastName: 'Smith' },
      { status: 'Baby', firstName: 'Bob', lastName: 'Jones' },
      { status: 'Full', firstName: 'Carol', lastName: 'White' },
      { status: 'Alumni', firstName: 'Dave', lastName: 'Black' },
    ])

    render(<MemberKanbanBoard members={members} />)

    expect(screen.getByText('Smith Alice')).toBeTruthy()
    expect(screen.getByText('Jones Bob')).toBeTruthy()
    expect(screen.getByText('White Carol')).toBeTruthy()
    expect(screen.getByText('Black Dave')).toBeTruthy()
  })

  it('shows correct member count badge per column', () => {
    const members = makeMembers([
      { status: 'Observer' },
      { status: 'Observer' },
      { status: 'Baby' },
    ])

    render(<MemberKanbanBoard members={members} />)

    // The badge spans contain counts; find all numeric badge text nodes
    const badges = screen.getAllByText(/^\d+$/)
    const counts = badges.map((b) => Number(b.textContent))
    expect(counts).toContain(2) // Observer column
    expect(counts).toContain(1) // Baby column
    expect(counts).toContain(0) // Full and Alumni
  })

  it('renders a link to the member profile for each card', () => {
    const members = makeMembers([{ id: 'mem-abc', status: 'Observer' }])

    render(<MemberKanbanBoard members={members} />)

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/information-book/mem-abc')
  })

  it('multiple members in same column all appear', () => {
    const members = makeMembers([
      { status: 'Full', firstName: 'Xena', lastName: 'Aaa' },
      { status: 'Full', firstName: 'Yuri', lastName: 'Bbb' },
      { status: 'Full', firstName: 'Zara', lastName: 'Ccc' },
    ])

    render(<MemberKanbanBoard members={members} />)

    expect(screen.getByText('Aaa Xena')).toBeTruthy()
    expect(screen.getByText('Bbb Yuri')).toBeTruthy()
    expect(screen.getByText('Ccc Zara')).toBeTruthy()
  })
})
