
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Create a Supabase client with the Admin key
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get authorization from request header
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'No authorization header' }),
      { headers: { 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  // Create the admin tables
  let success = true
  try {
    // Create admin_actions table
    const { error: adminActionsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS admin_actions (
          id UUID PRIMARY KEY,
          action_type TEXT NOT NULL,
          target_id TEXT NOT NULL,
          target_type TEXT NOT NULL,
          reason TEXT,
          duration TEXT,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          admin_id UUID NOT NULL
        );
      `
    })
    
    if (adminActionsError) {
      console.error('Error creating admin_actions table:', adminActionsError)
      success = false
    }

    // Create banned_users table
    const { error: bannedUsersError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS banned_users (
          id UUID PRIMARY KEY,
          identifier TEXT NOT NULL,
          identifier_type TEXT NOT NULL,
          reason TEXT NOT NULL,
          duration TEXT NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ,
          admin_id UUID NOT NULL
        );
      `
    })
    
    if (bannedUsersError) {
      console.error('Error creating banned_users table:', bannedUsersError)
      success = false
    }

    // Create reports_feedback table
    const { error: reportsFeedbackError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS reports_feedback (
          id UUID PRIMARY KEY,
          type TEXT NOT NULL,
          user_id UUID NOT NULL,
          content TEXT NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL,
          resolved BOOLEAN NOT NULL DEFAULT FALSE
        );
      `
    })
    
    if (reportsFeedbackError) {
      console.error('Error creating reports_feedback table:', reportsFeedbackError)
      success = false
    }
  } catch (error) {
    console.error('Error creating tables:', error)
    success = false
  }

  // Return success or error
  if (success) {
    return new Response(
      JSON.stringify({ success: true, message: 'Admin tables created successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } else {
    return new Response(
      JSON.stringify({ success: false, message: 'Error creating admin tables' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
