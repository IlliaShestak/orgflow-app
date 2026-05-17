#!/usr/bin/env tsx
/**
 * Import members from a Google Sheets XLSX export.
 *
 * Usage:
 *   npx tsx scripts/import-members.ts <path-to-xlsx>
 *
 * What it does:
 *   1. Reads the first sheet of the XLSX file (skipping the header row)
 *   2. Maps statuses, gender, dates
 *   3. Inserts Full/Alumni members first (oldest → newest), then Baby/Observer
 *   4. Sets mentor relations in a second pass
 *   5. Creates user accounts (password: ChangeMe123) for Full/Alumni/VP4HR members
 *   6. Writes all issues to scripts/import-report.txt
 */

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'
import * as bcrypt from 'bcryptjs'
import * as XLSX from 'xlsx'
import ws from 'ws'
import { config } from 'dotenv'

config({ path: path.resolve(process.cwd(), '.env') })

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── Column indices (0-based, per the agreed CSV structure) ─────────────────
const COL = {
  lastName:   0,
  firstName:  1,
  telegram:   2,
  instagram:  3,
  facebook:   4,
  birthDate:  5,
  phone:      6,
  email:      7,
  status:     8,
  // 9: last status change date — ignored
  joinedAt:   10,
  mentorName: 11,
  state:      12,
  // 13: last state change date — ignored
  gender:     14,
  studyYear:  15,
} as const

// ── Date parser: DD.MM.YYYY → Date (noon to avoid TZ shifts) ─────────────
function parseDate(s: string): Date | null {
  const clean = s.trim()
  if (!clean) return null
  const parts = clean.split('.')
  if (parts.length !== 3) return null
  const [d, m, y] = parts.map(Number)
  if (isNaN(d) || isNaN(m) || isNaN(y) || y < 1900 || y > 2100) return null
  return new Date(y, m - 1, d, 12, 0, 0)
}

// ── Status / role mapping ──────────────────────────────────────────────────
type DbStatus = 'Observer' | 'Baby' | 'Full' | 'Alumni'
type AccountRole = 'FullMember' | 'VP4HR'

const KNOWN_STATUSES = new Set([
  'Observer', 'Baby', 'Full', 'Alumni',
  'VP4HR', 'VP4CR', 'VP4PR', 'VP4DS', 'VP4IT',
  'President', 'Treasurer', 'Secretary', 'VP4IR',
])

function mapStatus(raw: string): { dbStatus: DbStatus; role: AccountRole | null } {
  switch (raw.trim()) {
    case 'Observer':   return { dbStatus: 'Observer', role: null }
    case 'Baby':       return { dbStatus: 'Baby',     role: null }
    case 'Full':       return { dbStatus: 'Full',     role: 'FullMember' }
    case 'Alumni':     return { dbStatus: 'Alumni',   role: 'FullMember' }
    case 'VP4HR':      return { dbStatus: 'Full',     role: 'VP4HR' }
    // These VP4* roles map to Baby — no account
    case 'VP4CR':
    case 'VP4PR':
    case 'VP4DS':
    case 'VP4IT':      return { dbStatus: 'Baby',     role: null }
    // Board/exec titles → Full member with account
    case 'President':
    case 'Treasurer':
    case 'Secretary':
    case 'VP4IR':      return { dbStatus: 'Full',     role: 'FullMember' }
    // Anything else unrecognized → treat as Full
    default:           return { dbStatus: 'Full',     role: 'FullMember' }
  }
}

function mapGender(raw: string): 'Male' | 'Female' | null {
  if (raw.trim() === 'Чоловік') return 'Male'
  if (raw.trim() === 'Жінка')   return 'Female'
  return null
}

// ── Main ───────────────────────────────────────────────────────────────────
interface ParsedRow {
  firstName:  string
  lastName:   string
  email:      string | null
  phone:      string | null
  telegram:   string | null
  instagram:  string | null
  facebook:   string | null
  birthDate:  Date | null
  joinedAt:   Date
  mentorName: string | null
  state:      'Active' | 'Inactive'
  gender:     'Male' | 'Female' | null
  studyYear:  number | null
  dbStatus:   DbStatus
  role:       AccountRole | null
  rowNum:     number  // original 1-based CSV row number (for issue reporting)
}

async function main() {
  const xlsxPath = process.argv[2]
  if (!xlsxPath) {
    console.error('Usage: npx tsx scripts/import-members.ts <path-to-xlsx>')
    process.exit(1)
  }

  const workbook = XLSX.readFile(path.resolve(xlsxPath))
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  // raw: false → all cells as strings; dateNF → dates formatted as DD.MM.YYYY
  const allRows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false,
    dateNF: 'DD.MM.YYYY',
  })
  // row 0 is the header; data starts at index 1
  const dataRows = allRows.slice(1) as string[][]
  console.log(`Sheet rows (excl. header): ${dataRows.length}`)

  const issues: string[] = []
  const unknownStatuses = new Set<string>()
  const parsed: ParsedRow[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const rowNum = i + 2  // 1-based: row 1 is header, data starts at row 2
    const cols = dataRows[i]

    const firstName = (cols[COL.firstName] ?? '').trim()
    const lastName  = (cols[COL.lastName]  ?? '').trim()
    if (!firstName && !lastName) continue // skip blank rows

    const rawStatus = (cols[COL.status] ?? '').trim()
    if (rawStatus && !KNOWN_STATUSES.has(rawStatus)) {
      unknownStatuses.add(rawStatus)
    }

    const { dbStatus, role } = mapStatus(rawStatus)

    const joinedAt = parseDate(cols[COL.joinedAt] ?? '')
    if (!joinedAt) {
      issues.push(`Row ${rowNum} "${firstName} ${lastName}": invalid joinedAt "${cols[COL.joinedAt] ?? ''}" — row skipped`)
      continue
    }

    const rawStudyYear = (cols[COL.studyYear] ?? '').trim()
    const studyYear = rawStudyYear ? (parseInt(rawStudyYear) || null) : null

    parsed.push({
      firstName,
      lastName,
      email:      (cols[COL.email]      ?? '').trim() || null,
      phone:      (cols[COL.phone]      ?? '').trim() || null,
      telegram:   (cols[COL.telegram]   ?? '').trim() || null,
      instagram:  (cols[COL.instagram]  ?? '').trim() || null,
      facebook:   (cols[COL.facebook]   ?? '').trim() || null,
      birthDate:  parseDate(cols[COL.birthDate] ?? ''),
      joinedAt,
      mentorName: (cols[COL.mentorName] ?? '').trim() || null,
      state:      (cols[COL.state] ?? '').trim() === 'Inactive' ? 'Inactive' : 'Active',
      gender:     mapGender(cols[COL.gender] ?? ''),
      studyYear,
      dbStatus,
      role,
      rowNum,
    })
  }

  if (unknownStatuses.size > 0) {
    const msg = `Unrecognized statuses (treated as Full Member): ${[...unknownStatuses].join(', ')}`
    console.warn(`\n⚠  ${msg}`)
    issues.push(msg)
  }

  // Full/Alumni first (oldest → newest), then Baby/Observer (oldest → newest)
  // This ensures mentors exist before their mentees when setting relations.
  const statusPriority = (s: DbStatus) => (s === 'Full' || s === 'Alumni') ? 0 : 1
  parsed.sort((a, b) => {
    const p = statusPriority(a.dbStatus) - statusPriority(b.dbStatus)
    return p !== 0 ? p : a.joinedAt.getTime() - b.joinedAt.getTime()
  })

  console.log(`\nParsed ${parsed.length} rows. Inserting members...`)

  // ── Pass 1: insert all members (mentor_id left null) ──────────────────
  // name → [id, ...] (array handles duplicate names)
  const nameToIds = new Map<string, string[]>()
  let inserted = 0

  for (const row of parsed) {
    try {
      const member = await prisma.member.create({
        data: {
          firstName: row.firstName,
          lastName:  row.lastName,
          email:     row.email,
          phone:     row.phone,
          telegram:  row.telegram,
          instagram: row.instagram,
          facebook:  row.facebook,
          birthDate: row.birthDate ?? undefined,
          joinedAt:  row.joinedAt,
          state:     row.state,
          status:    row.dbStatus,
          gender:    row.gender ?? undefined,
          studyYear: row.studyYear ?? undefined,
          family:    null,
        },
      })
      const key = `${row.firstName} ${row.lastName}`
      const ids = nameToIds.get(key) ?? []
      ids.push(member.id)
      nameToIds.set(key, ids)
      inserted++
      if (inserted % 100 === 0) process.stdout.write(`  ... ${inserted} inserted\n`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      issues.push(`Row ${row.rowNum} "${row.firstName} ${row.lastName}": insert failed — ${msg}`)
    }
  }

  console.log(`\nInserted: ${inserted}`)

  // ── Pass 2: set mentor relations ──────────────────────────────────────
  console.log('\nSetting mentor relations...')
  let mentorSet = 0

  for (const row of parsed) {
    if (!row.mentorName) continue

    const memberIds = nameToIds.get(`${row.firstName} ${row.lastName}`)
    if (!memberIds?.length) continue
    const memberId = memberIds[0]

    const mentorIds = nameToIds.get(row.mentorName)
    if (!mentorIds?.length) {
      issues.push(`Row ${row.rowNum} "${row.firstName} ${row.lastName}": mentor "${row.mentorName}" not found`)
      continue
    }
    if (mentorIds.length > 1) {
      issues.push(`Row ${row.rowNum} "${row.firstName} ${row.lastName}": mentor "${row.mentorName}" is ambiguous (${mentorIds.length} matches) — linked to first occurrence`)
    }

    await prisma.member.update({
      where: { id: memberId },
      data:  { mentorId: mentorIds[0] },
    })
    mentorSet++
  }

  console.log(`Mentor relations set: ${mentorSet}`)

  // ── Pass 3: create user accounts ─────────────────────────────────────
  console.log('\nCreating user accounts...')
  const passwordHash = await bcrypt.hash('ChangeMe123', 12)
  let accountsCreated = 0

  for (const row of parsed) {
    if (!row.role) continue  // Observer / Baby → no account

    if (!row.email) {
      issues.push(`"${row.firstName} ${row.lastName}" (${row.dbStatus}): needs account but has no email — skipped`)
      continue
    }

    const memberIds = nameToIds.get(`${row.firstName} ${row.lastName}`)
    if (!memberIds?.length) continue
    const memberId = memberIds[0]

    // Skip if this member already has a linked account (e.g. duplicate name share)
    const existing = await prisma.member.findUnique({ where: { id: memberId }, select: { userId: true } })
    if (existing?.userId) continue

    try {
      const user = await prisma.user.create({
        data: {
          email:             row.email,
          name:              `${row.firstName} ${row.lastName}`,
          role:              row.role,
          passwordHash,
          generatedPassword: 'ChangeMe123',
        },
      })
      await prisma.member.update({ where: { id: memberId }, data: { userId: user.id } })
      accountsCreated++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      issues.push(`"${row.firstName} ${row.lastName}": account creation failed — ${msg}`)
    }
  }

  console.log(`Accounts created: ${accountsCreated}`)

  // ── Write report ──────────────────────────────────────────────────────
  const reportPath = path.resolve(process.cwd(), 'scripts', 'import-report.txt')
  if (issues.length > 0) {
    fs.writeFileSync(reportPath, issues.join('\n') + '\n', 'utf-8')
    console.log(`\n⚠  ${issues.length} issue(s) written to scripts/import-report.txt`)
  } else {
    console.log('\n✓ No issues')
  }

  console.log('\n── Summary ──────────────────────────────────────')
  console.log(`  Members inserted : ${inserted}`)
  console.log(`  Mentor relations : ${mentorSet}`)
  console.log(`  Accounts created : ${accountsCreated}`)
  console.log('─────────────────────────────────────────────────')
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
