// Quick script to check if a booking token exists in the database
// Usage: NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=yyy npx tsx scripts/check-booking.ts <token>

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkBooking(token: string) {
  console.log('\nLooking for booking with token:', token)
  console.log('='.repeat(60))

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('booking_token', token)
    .single()

  if (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Code:', error.code)

    // Try to list all appointments
    console.log('\n📋 Fetching all appointments...')
    const { data: allAppointments, error: listError } = await supabase
      .from('appointments')
      .select('id, booking_token, start_time, status')
      .order('created_at', { ascending: false })
      .limit(10)

    if (listError) {
      console.error('Error listing appointments:', listError.message)
    } else if (allAppointments && allAppointments.length > 0) {
      console.log(`\nFound ${allAppointments.length} recent appointments:`)
      allAppointments.forEach((apt: any, i: number) => {
        console.log(`${i + 1}. Token: ${apt.booking_token}`)
        console.log(`   Time: ${apt.start_time}`)
        console.log(`   Status: ${apt.status}`)
        console.log()
      })
    } else {
      console.log('\n⚠️  No appointments found in database')
    }
  } else {
    console.log('\n✅ Found appointment!')
    console.log(JSON.stringify(data, null, 2))
  }
}

const token = process.argv[2]

if (!token) {
  console.error('Usage: npx tsx scripts/check-booking.ts <token>')
  process.exit(1)
}

checkBooking(token).then(() => {
  console.log('\nDone!')
  process.exit(0)
}).catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
