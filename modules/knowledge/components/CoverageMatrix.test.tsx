import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/modules/knowledge/actions/kspzActions', () => ({
  toggleKspzCoverage: vi.fn(),
}))

import { CoverageMatrix } from './CoverageMatrix'
import { toggleKspzCoverage } from '../actions/kspzActions'
import type { KspzTopic } from '../types'

// Minimal fixtures
const TOPICS: KspzTopic[] = [
  { id: 'topic-1', knowledgeTableId: 'table-1', name: 'TeamWork', order: 0, transferTypes: [{ knowledgeTransferTypeId: 'tt-1' }, { knowledgeTransferTypeId: 'tt-2' }] },
  { id: 'topic-2', knowledgeTableId: 'table-1', name: 'Feedback', order: 1, transferTypes: [{ knowledgeTransferTypeId: 'tt-1' }, { knowledgeTransferTypeId: 'tt-2' }] },
]

const MEMBERS = [
  { id: 'mem-1', firstName: 'Alice', lastName: 'Smith' },
  { id: 'mem-2', firstName: 'Bob', lastName: 'Jones' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CoverageMatrix', () => {
  it('renders member names and topic names', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={MEMBERS}
        coverage={[]}
        canEdit={true}
      />
    )

    expect(screen.getByText('Smith Alice')).toBeTruthy()
    expect(screen.getByText('Jones Bob')).toBeTruthy()
    expect(screen.getAllByText('TeamWork').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Feedback').length).toBeGreaterThan(0)
  })

  it('shows no covered indicators when coverage is empty', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={MEMBERS}
        coverage={[]}
        canEdit={true}
      />
    )

    const svgPaths = document.querySelectorAll('svg path')
    expect(svgPaths.length).toBe(0)
  })

  it('visually marks a covered cell (green background class)', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={MEMBERS}
        coverage={[
          { memberId: 'mem-1', knowledgeTopicId: 'topic-1', coveredAt: new Date() },
        ]}
        canEdit={true}
      />
    )

    const coveredButtons = document.querySelectorAll('button.bg-\\[\\#3CB371\\]')
    expect(coveredButtons.length).toBe(1)
  })

  it('shows checkmark SVG only for covered cells', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={MEMBERS}
        coverage={[
          { memberId: 'mem-1', knowledgeTopicId: 'topic-1', coveredAt: new Date() },
        ]}
        canEdit={true}
      />
    )

    const svgPaths = document.querySelectorAll('svg path')
    expect(svgPaths.length).toBe(1)
  })

  it('renders correct number of interactive buttons (members × topics)', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={MEMBERS}
        coverage={[]}
        canEdit={true}
      />
    )

    // 2 members × 2 topics = 4 buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(4)
  })

  it('all buttons are disabled when canEdit is false', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={MEMBERS}
        coverage={[]}
        canEdit={false}
      />
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true)
    })
  })

  it('does not call toggleKspzCoverage when canEdit is false and a button is clicked', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={MEMBERS}
        coverage={[]}
        canEdit={false}
      />
    )

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    expect(vi.mocked(toggleKspzCoverage)).not.toHaveBeenCalled()
  })

  it('shows empty state when members array is empty', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={[]}
        coverage={[]}
        canEdit={true}
      />
    )

    expect(screen.getByText('Учасників немає')).toBeTruthy()
  })

  it('shows empty state when topics array is empty', () => {
    render(
      <CoverageMatrix
        topics={[]}
        members={MEMBERS}
        coverage={[]}
        canEdit={true}
      />
    )

    expect(screen.getByText('Тем немає')).toBeTruthy()
  })

  it('covered cell button has title "Покрито"', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={MEMBERS}
        coverage={[
          { memberId: 'mem-1', knowledgeTopicId: 'topic-1', coveredAt: null },
        ]}
        canEdit={true}
      />
    )

    expect(screen.getByTitle('Покрито')).toBeTruthy()
  })

  it('uncovered cell button has title "Не покрито"', () => {
    render(
      <CoverageMatrix
        topics={TOPICS}
        members={MEMBERS}
        coverage={[]}
        canEdit={true}
      />
    )

    // 2 members × 2 topics = 4 uncovered buttons
    const uncoveredButtons = screen.getAllByTitle('Не покрито')
    expect(uncoveredButtons.length).toBe(4)
  })
})
