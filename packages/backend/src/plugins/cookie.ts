import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import type { FastifyInstance } from 'fastify';

const COOKIE_SECRET = process.env.COOKIE_SECRET!;

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(cookie, {
    secret: COOKIE_SECRET,
    parseOptions: {},
  });
});

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.SECURE_COOKIES === 'true',
  sameSite: 'lax' as const,
  path: '/trpc',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};
