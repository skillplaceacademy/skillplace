# Student Notification Center Implementation

## Overview
Build a proper notification center for students so they can view and read notifications sent by admins. This includes:
1. A dedicated "Notifications" page at `/student/notifications`
2. A notification bell icon in the student navbar with unread count badge
3. Mark as read functionality
4. Public notifications (target_user_id = null) should show to all students

## Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- Junction to: `D:\web software developement\skillplaceacademy\skillplace`

## Current State
- `src/app/student/dashboard/page.tsx` already fetches notifications but only shows 5 in a small card
- The query uses `.eq('user_id', user.id)` which won't show public notifications
- No dedicated notifications page exists
- No bell icon in navbar

## Tasks

### 1. Create Student Notifications Page
File: `src/app/student/notifications/page.tsx`

A full-page notification center with:
- Header with title and "Mark All Read" button
- Filter tabs: "All" | "Unread"
- List of notifications with:
  - Type icon/badge (Info/Success/Warning/Promo)
  - Title and message
  - Timestamp (relative: "2 hours ago", "Yesterday", etc.)
  - Unread indicator (blue dot on left)
  - Click to expand/mark as read
- Empty state when no notifications
- Load more / pagination if list is long

**Data fetching logic:**
```typescript
// Fetch individual notifications
const { data: individualNotifs } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// Fetch public notifications (target_user_id is null)
const { data: publicNotifs } = await supabase
  .from('notifications')
  .select('*')
  .is('target_user_id', null)
  .order('created_at', { ascending: false })

// Merge and deduplicate
const allNotifications = [...(individualNotifs || ...), ...(publicNotifs || [])]
// Sort by created_at descending, remove duplicates by id
```

### 2. Add Bell Icon to Student Navbar
File: `src/components/layout/Navbar.tsx` (or wherever the student navbar is)

Add a bell icon button in the navbar:
- Show unread count badge (red circle with number)
- Link to `/student/notifications`
- Fetch unread count on page load

**Unread count query:**
```typescript
// Count individual unread
const { count: individualUnread } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .eq('is_read', false)

// Count public unread (public notifications the user hasn't read)
const { count: publicUnread } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .is('target_user_id', null)
  .eq('is_read', false)

const totalUnread = (individualUnread || 0) + (publicUnread || 0)
```

### 3. Mark as Read Functionality
When a student clicks/views a notification:
```typescript
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId)
```

"Mark All Read" button:
```typescript
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('user_id', user.id)
  .eq('is_read', false)
```

### 4. Add "Notifications" Link in Student Sidebar/Navbar
Add a "Notifications" nav link with unread badge in the student navigation.

## Design Requirements
- Light theme (white bg, slate-900 text) — consistent with existing student dashboard
- Use Tailwind CSS only — no inline styles
- Use lucide-react icons (Bell, BellRing, Check, Info, AlertTriangle, Gift, CheckCircle)
- Type badges: Info=bg-blue-100 text-blue-700, Success=bg-green-100 text-green-700, Warning=bg-yellow-100 text-yellow-700, Promo=bg-purple-100 text-purple-700
- Unread notifications have a blue left border accent and bold title
- Read notifications have reduced opacity
- Relative timestamps: "Just now", "5 min ago", "2 hours ago", "Yesterday", "Jun 25"
- Empty state with Bell icon and "No notifications yet" message
- Badge on bell: red bg, white text, rounded-full, positioned top-right of icon

## DO NOT
- Do NOT git push
- Do NOT modify admin files
- Do NOT use inline styles or CSS-in-JS
- Do NOT delete existing notification fetching from student dashboard (keep it for backward compatibility)

## After Completion
1. Run `npx tsc --noEmit` and fix ALL type errors
2. Verify with `git log --oneline -3`
3. Verify the page loads at `/student/notifications`
4. Verify the bell icon shows in the navbar with unread count
