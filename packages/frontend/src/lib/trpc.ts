import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@remnant/backend/trpc/router';

export const trpc = createTRPCReact<AppRouter>();

export function createTRPCClient(getToken: () => string | null) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/trpc',
        transformer: superjson,
        headers: () => {
          const token = getToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        },
      }),
    ],
  });
}
