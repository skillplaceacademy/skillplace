# Schedule Notification Feature Implementation

## Overview
Add a "Schedule" option to the existing Notifications page (`src/app/admin-place/notifications/page.tsx`). When sending a notification, admin can either:
- **Send Now** — immediate notification (current behavior)
- **Schedule** — schedule the notification to be sent at a future date and time

Additionally, add a "Scheduled Notifications" tab/list so admins can view, edit, and delete scheduled notifications. A cron job or API route will be needed to process scheduled notifications at their scheduled time.

## Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- Junction to: `D:\web software developement\skillplaceacademy\skillplace`

## Database Schema
First, add a `scheduled_notifications` table in Supabase SQL Editor:

```sql
CREATE TABLE public.scheduled_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  target_user_id uuid NULL,
  title text NOT NULL,
  message text NULL,
  type text NULL DEFAULT 'info',
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz NULL,
  status text NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  metadata jsonb NULL DEFAULT '{"is_scheduled": true}'::jsonb,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  CONSTRAINT scheduled_notifications_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON public.scheduled_notifications USING btree (status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_at ON public.scheduled_notifications USING btree (scheduled_at);
```

Also add this function/API route to process scheduled notifications:

```sql
-- Function to get pending scheduled notifications that are due
CREATE OR REPLACE FUNCTION get_due_scheduled_notifications()
RETURNS SETOF scheduled_notifications AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM scheduled_notifications
  WHERE status = 'pending'
    AND scheduled_at <= now()
  ORDER BY scheduled_at ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
```

## Tasks

### 1. Create Cleanup Function
Add a helper function in `src/lib/admin-api.ts` (do NOT modify admin-api.ts — instead create a new file):

Create file: `src/lib/scheduled-notifications.ts`

```typescript
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

export async function markScheduledAsSent(id: string, targetUserId: string | null, title: string, message: string | null, type: string) {
  // Mark as sent
  await adminSupabase
    .from('scheduled_notifications')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id)

  // Create the actual notification
  await adminSupabase.from('notifications').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    target_user_id: targetUserId,
    title,
    message,
    type,
    is_read: false,
    metadata: { is_scheduled: true, scheduled_notification_id: id }
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
```

### 2. Update Notifications Page
File: `src/app/admin-place/notifications/page.tsx`

Modify the existing notifications page to add scheduling:

**A) Add new state:**
```typescript
type SendMode = 'individual' | 'public'
type DeliveryMode = 'now' // already have this concept — just add 'scheduled'
```

**B) Add new form fields state:**
```typescript
const [deliveryMode, setDeliveryMode] = useState<'now' | 'scheduled'>('now')
const [scheduledDate, setScheduledDate] = useState('')
const [scheduledTime, setScheduledTime] = useState('')
```

**C) Add a "Scheduled Notifications" tab section BELOW the existing notification list:**

The page should have two tabs:
1. **Sent Notifications** — existing list of sent notifications
2. **Scheduled Notifications** — new list showing pending/scheduled notifications

Each scheduled notification card shows:
- Title, message, type badge
- Scheduled date/time (with a clock icon)
- Target student name (or "All Students" for public)
- Status badge (Pending / Sent / Failed / Cancelled)
- Cancel button (only for pending)
- Delete button

**D) Update the Send Dialog:**

Add a toggle at the top of the form:
- **Send Now** (default) — current behavior
- **Schedule for Later** — shows date and time pickers

When "Schedule for Later" is selected:
- Hide the student selector initially (or keep it — they can still pick)
- Show date picker (input type="date")
- Show time picker (input type="time")
- Submit button text changes to "Schedule Notification"

**E) Update handleSubmit:**
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (!formData.title.trim()) return
  if (sendMode === 'individual' && !formData.target_user_id) return
  setSaving(true)

  try {
    if (deliveryMode === 'scheduled') {
      // Save to scheduled_notifications table
      const payload = {
        user_id: '00000000-0000-0000-0000-000000000000',
        target_user_id: sendMode === 'public' ? null : formData.target_user_id,
        title: formData.title.trim(),
        message: formData.message.trim() || null,
        type: formData.type,
        scheduled_at: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
        status: 'pending',
        metadata: sendMode === 'public' ? { is_public: true, is_scheduled: true } : { is_scheduled: true },
      }
      await createRecord('scheduled_notifications', payload)
    } else {
      // Existing immediate send logic
      const payload = {
        user_id: '00000000-0000-0000-0000-000000000000',
        target_user_id: sendMode === 'public' ? null : formData.target_user_id,
        title: formData.title.trim(),
        message: formData.message.trim() || null,
        type: formData.type,
        is_read: false,
        metadata: sendMode === 'public' ? { is_public: true } : null,
      }
      await createRecord('notifications', payload)
    }

    setShowForm(false)
    fetchData()
  } catch {
    // handled silently
  } finally {
    setSaving(false)
  }
}
```

### 3. Add API Route to Process Scheduled Notifications
File: `src/app/api/cron/process-scheduled-notifications/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getDueScheduledNotifications, markScheduledAsSent } from '@/lib/scheduled-notifications'

export async function GET(request: NextRequest) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dueNotifications = await getDueScheduledNotifications()
    
    for (const notif of dueNotifications) {
      await markScheduledAsSent(
        notif.id,
        notif.target_user_id,
        notif.title,
        notif.message,
        notif.type
      )
    }

    return NextResponse.json({ processed: dueNotifications.length })
  } catch (error) {
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
```

### 4. Add a Manual "Process Now" Button
In the admin notifications page, add a "Process Scheduled" button in the Scheduled Notifications tab header that manually triggers processing (for testing without setting up cron).

## Design Requirements
- Light theme (white bg, slate-900 text) — consistent with existing admin pages
- Use Tailwind CSS only — no inline styles
- Use lucide-react icons (Calendar, Clock, Send, CalendarClock)
- Status badges: Pending=bg-yellow-100 text-yellow-700, Sent=bg-green-100 text-green-700, Failed=bg-red-100 text-red-700, Cancelled=bg-slate-100 text-slate-600
- Scheduled date/time display with clock icon
- Tab navigation: "Sent Notifications" | "Scheduled Notifications"

## DO NOT
- Do NOT git push
- Do NOT modify files outside the notification/schedule feature
- Do NOT use inline styles or CSS-in-JS
- Do NOT delete existing notification functionality — ADD scheduling to it

## After Completion
1. Run `npx tsc --noEmit` and fix ALL type errors
2. Verify with `git log --oneline -3`
3. Verify the page loads at `/admin-place/notifications` with the new Scheduled tab
