import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🗑️ Delete user data function called')

    // Get the request body
    const requestData = await req.json()
    const userId = requestData?.userId
    console.log('User ID from request:', userId)

    if (!userId) {
      throw new Error('Missing userId in request body')
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the user exists
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError) {
      console.error('User lookup error:', userError)
      throw new Error(`User not found: ${userError.message}`)
    }

    if (!user) {
      console.error('No user found with ID:', userId)
      throw new Error('User not found')
    }

    console.log('User verified:', userId)

    // First check if there are any subscriptions to delete
    console.log('Checking for subscriptions for user:', userId)
    const { data: existingSubs, error: checkError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (checkError) {
      console.error('Error checking subscriptions:', checkError)
      throw new Error(`Failed to check subscriptions: ${checkError.message}`)
    }

    console.log('Found subscriptions:', existingSubs?.length || 0, JSON.stringify(existingSubs, null, 2))

    // Delete all subscription records for this user
    if (existingSubs && existingSubs.length > 0) {
      console.log('Attempting to delete subscriptions for user:', userId)
      const { data: deletedData, error: deleteSubsError } = await supabaseAdmin
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)
        .select()

      if (deleteSubsError) {
        console.error('Delete error:', deleteSubsError)
        throw new Error(`Failed to delete subscriptions: ${deleteSubsError.message}`)
      }

      console.log('Successfully deleted subscriptions:', deletedData?.length || 0)
    } else {
      console.log('No subscriptions found to delete for user:', userId)
    }

    const deletedCount = existingSubs?.length || 0

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User data deleted successfully',
        userId: userId,
        deletedCount: deletedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error in delete-user-data:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
