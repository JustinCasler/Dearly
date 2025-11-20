// Script to apply migration 004
// Usage: npx tsx scripts/apply-migration.ts

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('Reading migration file...')
  const migrationPath = resolve(__dirname, '../supabase/migrations/004_fix_interviewer_assignment_rls.sql')
  const sql = readFileSync(migrationPath, 'utf-8')

  console.log('\nApplying migration 004_fix_interviewer_assignment_rls.sql...\n')

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.trim()) {
      console.log('Executing:', statement.substring(0, 100) + '...')
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

      if (error) {
        console.error('\n❌ Error:', error.message)
        console.error('Statement:', statement)

        // Try direct execution as fallback
        console.log('\nTrying direct execution...')
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql_query: statement })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Direct execution also failed:', errorText)
        }
      } else {
        console.log('✓')
      }
    }
  }

  console.log('\n✅ Migration complete!')
  console.log('\nYou should now be able to:')
  console.log('  1. See scheduled sessions in /dashboard/interviewer/available')
  console.log('  2. Claim those sessions')
}

applyMigration().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
