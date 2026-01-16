/**
 * Script to create a new user in Supabase
 * Run with: node scripts/create-user.js
 * 
 * Make sure your .env.local file has SUPABASE_SERVICE_ROLE_KEY set
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Read .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split(/\r?\n/).forEach(line => {
      line = line.trim()
      // Skip comments and empty lines
      if (line && !line.startsWith('#')) {
        const match = line.match(/^([^=:#]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          let value = match[2].trim()
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          process.env[key] = value
        }
      }
    })
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createUser() {
  try {
    console.log('Creating user: Oxford (oxfordgalawan@gmail.com)...')
    
    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'oxfordgalawan@gmail.com',
      password: 'hackmenot',
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Oxford'
      }
    })

    if (authError) {
      throw authError
    }

    console.log('✓ User created in auth.users')
    console.log('  User ID:', authData.user.id)
    console.log('  Email:', authData.user.email)

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update user profile to approved and set as admin
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        status: 'approved',
        role: 'admin',
        approved_at: new Date().toISOString()
      })
      .eq('email', 'oxfordgalawan@gmail.com')
      .select()

    if (profileError) {
      console.warn('⚠ Warning: Could not update user profile:', profileError.message)
      console.warn('  You may need to manually update the profile in Supabase dashboard')
    } else {
      console.log('✓ User profile updated')
      console.log('  Status: approved')
      console.log('  Role: admin')
    }

    console.log('\n✅ User created successfully!')
    console.log('\nLogin credentials:')
    console.log('  Email: oxfordgalawan@gmail.com')
    console.log('  Password: hackmenot')

  } catch (error) {
    console.error('❌ Error creating user:', error.message)
    process.exit(1)
  }
}

createUser()

