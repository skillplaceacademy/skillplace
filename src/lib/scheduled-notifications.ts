import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

export async function getDueScheduledNotifications() {
  const { data, error } = await adminSupabase
    .from('scheduled_notifications')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(50)
  if (error) return []
  return data || []
}

export async function markScheduledAsSent(
  id: string,
  targetUserId: string | null,
  title: string,
  message: string | null,
  type: string
) {
  await adminSupabase
    .from('scheduled_notifications')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id)

  await adminSupabase.from('notifications').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    target_user_id: targetUserId,
    title,
    message,
    type,
    is_read: false,
    metadata: { is_scheduled: true, scheduled_notification_id: id },
  })
}

export async function getScheduledNotifications() {
  const { data, error } = await adminSupabase
    .from('scheduled_notifications')
    .select('*,profiles(full_name,email)')
    .order('scheduled_at', { ascending: false })
  if (error) return []
  return data || []
}
