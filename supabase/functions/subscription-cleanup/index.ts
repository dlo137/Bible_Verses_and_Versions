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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current timestamp
    const now = new Date()
    console.log(`🧹 Starting subscription cleanup at ${now.toISOString()}`)

    // 1. Mark expired subscriptions as inactive
    const { data: expiredSubs, error: expiredError } = await supabaseClient
      .from('subscriptions')
      .update({ 
        status: 'expired',
        last_updated: now.toISOString()
      })
      .lt('expired_at', now.toISOString())
      .eq('status', 'active')
      .select('id, user_id, product_id')

    if (expiredError) {
      throw new Error(`Failed to update expired subscriptions: ${expiredError.message}`)
    }

    console.log(`📱 Marked ${expiredSubs?.length || 0} subscriptions as expired`)

    // 2. Clean up old anonymous users (inactive for 90+ days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // Find users with no active subscriptions and haven't logged in recently
    const { data: inactiveUsers, error: inactiveError } = await supabaseClient
      .from('auth.users')
      .select('id, is_anonymous, last_sign_in_at')
      .eq('is_anonymous', true)
      .lt('last_sign_in_at', ninetyDaysAgo.toISOString())
      .limit(100) // Process in batches to avoid timeouts

    if (inactiveError) {
      throw new Error(`Failed to find inactive users: ${inactiveError.message}`)
    }

    let cleanedUsers = 0
    let cleanedSubscriptions = 0

    for (const user of inactiveUsers || []) {
      // Check if user has any active subscriptions
      const { data: activeSubs, error: subError } = await supabaseClient
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)

      if (subError) {
        console.error(`❌ Error checking subscriptions for user ${user.id}:`, subError)
        continue
      }

      // Only clean up users with no active subscriptions
      if (!activeSubs || activeSubs.length === 0) {
        // Delete old subscription records
        const { error: deleteSubsError } = await supabaseClient
          .from('subscriptions')
          .delete()
          .eq('user_id', user.id)
          .neq('status', 'active')

        if (deleteSubsError) {
          console.error(`❌ Error deleting subscriptions for user ${user.id}:`, deleteSubsError)
          continue
        }

        // Delete the user
        const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(user.id)

        if (deleteUserError) {
          console.error(`❌ Error deleting user ${user.id}:`, deleteUserError)
          continue
        }

        cleanedUsers++
        cleanedSubscriptions += await getOldSubscriptionCount(user.id, supabaseClient)
      }
    }

    console.log(`🗑️ Cleaned up ${cleanedUsers} inactive anonymous users`)
    console.log(`📋 Cleaned up ${cleanedSubscriptions} old subscription records`)

    // 3. Clean up orphaned subscription records (users that don't exist)
    const { data: orphanedSubs, error: orphanedError } = await supabaseClient
      .rpc('delete_orphaned_subscriptions')

    if (orphanedError) {
      console.error('❌ Error cleaning orphaned subscriptions:', orphanedError)
    } else {
      console.log(`🧽 Cleaned up ${orphanedSubs || 0} orphaned subscription records`)
    }

    // 4. Update subscription statistics
    const stats = await generateCleanupStats(supabaseClient)

    const response = {
      success: true,
      timestamp: now.toISOString(),
      summary: {
        expired_subscriptions: expiredSubs?.length || 0,
        cleaned_users: cleanedUsers,
        cleaned_subscriptions: cleanedSubscriptions,
        orphaned_records: orphanedSubs || 0
      },
      statistics: stats
    }

    console.log('✅ Cleanup completed successfully:', response.summary)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Subscription cleanup failed:', error)

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function getOldSubscriptionCount(userId: string, client: any): Promise<number> {
  try {
    const { count } = await client
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'active')

    return count || 0
  } catch (error) {
    console.error('Error counting old subscriptions:', error)
    return 0
  }
}

async function generateCleanupStats(client: any) {
  try {
    const [
      { data: totalUsers },
      { data: activeUsers },
      { data: totalSubs },
      { data: activeSubs },
      { data: expiredSubs }
    ] = await Promise.all([
      client.from('auth.users').select('*', { count: 'exact', head: true }),
      client.from('auth.users').select('*', { count: 'exact', head: true }).gte('last_sign_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      client.from('subscriptions').select('*', { count: 'exact', head: true }),
      client.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      client.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'expired')
    ])

    return {
      total_users: totalUsers?.length || 0,
      active_users_30d: activeUsers?.length || 0,
      total_subscriptions: totalSubs?.length || 0,
      active_subscriptions: activeSubs?.length || 0,
      expired_subscriptions: expiredSubs?.length || 0
    }
  } catch (error) {
    console.error('Error generating stats:', error)
    return {}
  }
}

/* Deno.json for this function:
{
  "importMap": "import_map.json",
  "tasks": {
    "start": "deno run --allow-net --allow-env index.ts"
  }
}
*/