/**
 * Shared Supabase configuration.
 * All Supabase clients should import from here to ensure consistency.
 */

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

/**
 * Returns the Supabase URL with REST suffix stripped.
 * The `/rest/v1/` suffix is added by default Supabase projects;
 * Supabase JS client expects the base URL without it.
 */
export function getSupabaseUrl(): string {
  return rawUrl.replace(/\/rest\/v1\/?$/, '')
}

/**
 * Returns the Supabase anonymous key.
 */
export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

/**
 * Returns the Supabase service role key (server-side only).
 * NEVER import this in client components.
 */
export function getSupabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}
