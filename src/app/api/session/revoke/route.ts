import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

/**
 * Revoke session(s) on logout or idle timeout.
 * 
 * POST /api/session/revoke
 * Body: { type: 'current' | 'all', session_token?: string }
 * 
 * - 'current': Revoke the session identified by session_token (from cookie)
 * - 'all': Revoke ALL active sessions for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated via the sb-access-token cookie
    const accessToken = request.cookies.get('sb-access-token')?.value
    if (!accessToken) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await adminSupabase.auth.getUser(accessToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { type = 'current' } = body

    if (type === 'all') {
      // Revoke ALL active sessions for this user
      const { data: activeSessions } = await adminSupabase
        .from('user_sessions')
        .select('id, session_token')
        .eq('user_id', user.id)
        .eq('is_active', true)

      const { error } = await adminSupabase
        .from('user_sessions')
        .update({
          is_active: false,
          is_revoked: true,
          revoked_at: new Date().toISOString(),
          revoke_reason: 'logout_all',
          logout_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Insert into revoked_tokens for JWT blacklist check
      if (activeSessions && activeSessions.length > 0) {
        await adminSupabase.from('revoked_tokens').insert(
          activeSessions.map(s => ({
            token: s.session_token,
            user_id: user.id,
            reason: 'logout_all',
          }))
        ).then(() => {}, () => {})
      }

      return NextResponse.json({ success: true, revoked: activeSessions?.length || 0 })
    }

    // type === 'current' — revoke by session_token
    const sessionToken = body.session_token as string | undefined

    if (!sessionToken) {
      return NextResponse.json({ error: 'Missing session_token' }, { status: 400 })
    }

    // Verify the session belongs to this user
    const { data: session } = await adminSupabase
      .from('user_sessions')
      .select('id, user_id')
      .eq('session_token', sessionToken)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const { error } = await adminSupabase
      .from('user_sessions')
      .update({
        is_active: false,
        is_revoked: true,
        revoked_at: new Date().toISOString(),
        revoke_reason: 'logout',
        logout_at: new Date().toISOString(),
      })
      .eq('session_token', sessionToken)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Add to revoked tokens blacklist
    await adminSupabase.from('revoked_tokens').insert({
      token: sessionToken,
      user_id: user.id,
      reason: 'logout',
    }).then(() => {}, () => {})

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Auto-revoke idle/expired sessions (called by cron or manually).
 * Marks sessions as inactive if:
 * - expires_at has passed, OR
 * - last_active_at > 30 minutes ago
 */
export async function PATCH() {
  const now = new Date().toISOString()
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  try {
    // Revoke expired sessions
    const { data: expiredSessions } = await adminSupabase
      .from('user_sessions')
      .select('id, session_token, user_id')
      .eq('is_active', true)
      .lt('expires_at', now)

    // Revoke idle sessions (no activity in 30 min)
    const { data: idleSessions } = await adminSupabase
      .from('user_sessions')
      .select('id, session_token, user_id')
      .eq('is_active', true)
      .lt('last_active_at', thirtyMinAgo)

    const toRevoke = [...(expiredSessions || []), ...(idleSessions || [])]
    const uniqueIds = Array.from(new Set(toRevoke.map(s => s.id)))

    if (uniqueIds.length > 0) {
      await adminSupabase
        .from('user_sessions')
        .update({
          is_active: false,
          is_revoked: true,
          revoked_at: now,
          revoke_reason: 'auto_expired',
        })
        .in('id', uniqueIds)

      // Add tokens to blacklist
      const tokens = toRevoke.map(s => ({
        token: s.session_token,
        user_id: s.user_id,
        reason: 'auto_expired',
      }))
      await adminSupabase.from('revoked_tokens').insert(tokens).then(() => {}, () => {})
    }

    return NextResponse.json({ success: true, revoked: uniqueIds.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
