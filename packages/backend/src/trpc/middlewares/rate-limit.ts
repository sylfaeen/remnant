import { TRPCError } from '@trpc/server';
import { ErrorCodes, type Permission } from '@remnant/shared';
import { publicProcedure } from '@remnant/backend/trpc';
import { protectedProcedure, requirePermission } from '@remnant/backend/trpc/middlewares/auth';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const INTERVAL = 5 * 60 * 1000; // 5 minutes

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, INTERVAL);

function checkRateLimit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  const entry = store.get(key);

  if (entry && now < entry.resetAt) {
    if (entry.count >= max) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: ErrorCodes.RATE_LIMITED,
      });
    }
    entry.count++;
  } else {
    store.set(key, { count: 1, resetAt: now + windowMs });
  }
}

/** Rate-limited public procedure (keyed by IP) */
export function rateLimitedProcedure(max: number, windowMs: number) {
  return publicProcedure.use(async ({ ctx, next, path }) => {
    checkRateLimit(`ip:${ctx.req.ip}:${path}`, max, windowMs);
    return next({ ctx });
  });
}

/** Rate-limited protected procedure (keyed by user ID) */
export function rateLimitedProtectedProcedure(max: number, windowMs: number) {
  return protectedProcedure.use(async ({ ctx, next, path }) => {
    checkRateLimit(`user:${ctx.user.sub}:${path}`, max, windowMs);
    return next({ ctx });
  });
}

/** Rate-limited procedure with permission check (keyed by user ID) */
export function rateLimitedPermission(max: number, windowMs: number, ...permissions: Array<Permission>) {
  return requirePermission(...permissions).use(async ({ ctx, next, path }) => {
    checkRateLimit(`user:${ctx.user.sub}:${path}`, max, windowMs);
    return next({ ctx });
  });
}
