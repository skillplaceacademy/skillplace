interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

function getCleanedKey(identifier: string, windowMs: number): string {
  return `${identifier}:${Math.floor(Date.now() / windowMs)}`
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = getCleanedKey(identifier, windowMs)
  const now = Date.now()
  const resetTime = Math.ceil((Math.floor(now / windowMs) + 1) * windowMs)

  const existing = store.get(key)
  if (existing) {
    if (existing.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: resetTime - now }
    }
    existing.count++
    return { allowed: true, remaining: maxRequests - existing.count, resetIn: resetTime - now }
  }

  store.set(key, { count: 1, resetTime })

  if (store.size > 10000) {
    const cutoff = now - windowMs * 2
    for (const [k, v] of store) {
      if (v.resetTime < cutoff) {
        store.delete(k)
      }
    }
  }

  return { allowed: true, remaining: maxRequests - 1, resetIn: resetTime - now }
}

export function getRateLimitHeaders(
  result: { allowed: boolean; remaining: number; resetIn: number }
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  }
  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil(result.resetIn / 1000).toString()
  }
  return headers
}
