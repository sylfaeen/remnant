import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { db } from '@remnant/backend/db';
import { users } from '@remnant/backend/db/schema';
import { router, publicProcedure } from '@remnant/backend/trpc';
import { rateLimitedProcedure } from '@remnant/backend/trpc/middlewares/rate-limit';
import { AuthService } from '@remnant/backend/services/auth_service';
import { REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions } from '@remnant/backend/plugins/cookie';
import { setupRequestSchema, ErrorCodes } from '@remnant/shared';

const BCRYPT_ROUNDS = 12;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MS = 60 * 1000; // 5 attempts per minute

async function assertNeedsSetup(): Promise<void> {
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: ErrorCodes.SETUP_ALREADY_COMPLETED,
    });
  }
}

export const onboardingRouter = router({
  needsSetup: publicProcedure.query(async () => {
    const existingUsers = await db.select().from(users).limit(1);
    return { needsSetup: existingUsers.length === 0 };
  }),

  setup: rateLimitedProcedure(RATE_LIMIT_MAX, RATE_LIMIT_MS)
    .input(setupRequestSchema)
    .mutation(async ({ input, ctx }) => {
      await assertNeedsSetup();

      const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

      const [newUser] = await db
        .insert(users)
        .values({
          username: input.username,
          password_hash: passwordHash,
          permissions: JSON.stringify(['*']),
          locale: input.locale ?? null,
        })
        .returning();

      // Auto-login: generate tokens and set cookie
      const authService = new AuthService(ctx.req.server);
      const accessToken = authService.generateAccessToken(newUser);
      const refreshToken = authService.generateRefreshToken();
      await authService.createSession(newUser.id, refreshToken);

      ctx.res.setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions(ctx.req));

      return {
        access_token: accessToken,
        user: {
          id: newUser.id,
          username: newUser.username,
          permissions: JSON.parse(newUser.permissions) as Array<string>,
          locale: newUser.locale ?? null,
        },
      };
    }),
});
