import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from './config'

const supabaseUrl = getSupabaseUrl()
const serviceKey = getSupabaseServiceKey()

export const adminSupabase: SupabaseClient = (supabaseUrl && serviceKey)
  ? createClient(supabaseUrl, serviceKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
