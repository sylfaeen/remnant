import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '@remnant/backend/trpc';
import { protectedProcedure } from '@remnant/backend/trpc/middlewares/auth';
import { rateLimitedProcedure } from '@remnant/backend/trpc/middlewares/rate-limit';
import { AuthService } from '@remnant/backend/services/auth_service';
import { totpService } from '@remnant/backend/services/totp_service';
import { auditService } from '@remnant/backend/services/audit_service';
import { REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions } from '@remnant/backend/plugins/cookie';
import { loginRequestSchema, verifyTotpLoginRequestSchema, ErrorCodes } from '@remnant/shared';

// 5 attempts per minute for auth routes
const authRateLimited = rateLimitedProcedure(5, 60 * 1000);

export const authRouter = router({
  login: authRateLimited.input(loginRequestSchema).mutation(async ({ input, ctx }) => {
    const authService = new AuthService(ctx.req.server);
    const { valid, user } = await authService.validateCredentials(input.username, input.password);

    if (!valid || !user) {
      await auditService.log({
        userId: null,
        username: input.username,
        action: 'login_failed',
        resourceType: 'auth',
        ip: ctx.req.ip,
      });
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: ErrorCodes.AUTH_INVALID_CREDENTIALS,
      });
    }

    // Check if user has 2FA enabled
    const totpEnabled = await totpService.isTotpEnabled(user.id);
    if (totpEnabled) {
      const totpToken = authService.generateTotpToken(user.id);
      return { requires_totp: true as const, totp_token: totpToken };
    }

    // Standard login (no 2FA)
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken();
    await authService.createSession(user.id, refreshToken);
    ctx.res.setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions(ctx.req));

    await auditService.log({
      userId: user.id,
      username: user.username,
      action: 'login',
      resourceType: 'auth',
      ip: ctx.req.ip,
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        permissions: JSON.parse(user.permissions) as Array<string>,
        locale: user.locale ?? null,
      },
    };
  }),

  verifyTotp: authRateLimited.input(verifyTotpLoginRequestSchema).mutation(async ({ input, ctx }) => {
    const authService = new AuthService(ctx.req.server);

    // Verify the TOTP token
    const { valid, userId } = authService.verifyTotpToken(input.totp_token);
    if (!valid || !userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: ErrorCodes.AUTH_TOKEN_EXPIRED,
      });
    }

    // Try TOTP code first, then recovery code
    let codeValid = await totpService.verifyTotpCode(userId, input.code);
    let usedRecoveryCode = false;

    if (!codeValid) {
      codeValid = await totpService.verifyRecoveryCode(userId, input.code);
      usedRecoveryCode = codeValid;
    }

    if (!codeValid) {
      await auditService.log({
        userId,
        username: null,
        action: 'totp_failed',
        resourceType: 'auth',
        ip: ctx.req.ip,
      });
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ErrorCodes.TOTP_INVALID_CODE,
      });
    }

    // Get user and complete login
    const { users } = await import('@remnant/backend/db/schema');
    const { eq } = await import('drizzle-orm');
    const { db } = await import('@remnant/backend/db');
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: ErrorCodes.AUTH_TOKEN_INVALID,
      });
    }

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken();
    await authService.createSession(user.id, refreshToken);
    ctx.res.setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions(ctx.req));

    await auditService.log({
      userId: user.id,
      username: user.username,
      action: usedRecoveryCode ? 'login_recovery_code' : 'login_totp',
      resourceType: 'auth',
      ip: ctx.req.ip,
    });

    const result: Record<string, unknown> = {
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        permissions: JSON.parse(user.permissions) as Array<string>,
        locale: user.locale ?? null,
      },
    };

    if (usedRecoveryCode) {
      result.recovery_codes_remaining = await totpService.getRemainingRecoveryCodes(userId);
    }

    return result;
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const authService = new AuthService(ctx.req.server);
    const refreshToken = ctx.req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (refreshToken) {
      await authService.invalidateSession(refreshToken);
    }

    ctx.res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/trpc' });

    await auditService.log({
      userId: ctx.user?.sub ?? null,
      username: ctx.user?.username ?? null,
      action: 'logout',
      resourceType: 'auth',
      ip: ctx.req.ip,
    });

    return { message: 'Logged out successfully' };
  }),

  refresh: authRateLimited.mutation(async ({ ctx }) => {
    const authService = new AuthService(ctx.req.server);
    const refreshToken = ctx.req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: ErrorCodes.AUTH_TOKEN_INVALID,
      });
    }

    const result = await authService.refresh(refreshToken);

    if (!result.success) {
      ctx.res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/trpc' });
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: ErrorCodes.AUTH_TOKEN_EXPIRED,
      });
    }

    ctx.res.setCookie(REFRESH_TOKEN_COOKIE_NAME, result.newRefreshToken, getRefreshTokenCookieOptions(ctx.req));

    return result.data;
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const userService = await import('@remnant/backend/services/user_service');
    const service = new userService.UserService();
    const user = await service.getUserById(ctx.user.sub);
    return {
      id: ctx.user.sub,
      username: ctx.user.username,
      permissions: ctx.user.permissions,
      locale: user?.locale ?? null,
    };
  }),
});
