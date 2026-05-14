import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  // knowledge_transfer_types
  const transferTypes = ['Training', 'Sharing', 'Workshop', 'Mentoring', 'Self-study']
  for (const name of transferTypes) {
    await sql`
      INSERT INTO knowledge_transfer_types (id, name)
      VALUES (gen_random_uuid(), ${name})
      ON CONFLICT (name) DO NOTHING
    `
  }
  console.log('Seeded knowledge_transfer_types')

  // Test users — password field is ignored, login with email only
  const users = [
    { email: 'admin@orgflow.test', name: 'Admin User', role: 'admin' },
    { email: 'vp4hr@orgflow.test', name: 'VP4HR User', role: 'vp4hr' },
    { email: 'member@orgflow.test', name: 'Full Member', role: 'full_member' },
  ]
  for (const u of users) {
    await sql`
      INSERT INTO users (id, email, name, role, created_at)
      VALUES (gen_random_uuid(), ${u.email}, ${u.name}, ${u.role}, NOW())
      ON CONFLICT (email) DO UPDATE SET name = ${u.name}, role = ${u.role}
    `
  }

  console.log('Seeded test users:')
  console.log('  Admin:      admin@orgflow.test')
  console.log('  VP4HR:      vp4hr@orgflow.test')
  console.log('  FullMember: member@orgflow.test')
  console.log('(enter email on the login page — password field is ignored)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
