import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()
    
    if (!user_id) {
      throw new Error('user_id is required')
    }

    const defaultCategories = [
      { name: 'Food', icon: 'food', is_system: true },
      { name: 'Entertainment', icon: 'movie', is_system: true },
      { name: 'Shopping', icon: 'cart', is_system: true },
      { name: 'Transport', icon: 'car', is_system: true },
      { name: 'Other', icon: 'dots-horizontal', is_system: true }
    ]

    const { data, error } = await supabaseClient
      .from('categories')
      .insert(defaultCategories.map(category => ({
        ...category,
        user_id
      })))

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
