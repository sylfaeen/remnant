import { trpc } from '@remnant/frontend/lib/trpc';

export function useInstalledJava() {
  return trpc.java.getInstalledVersions.useQuery(undefined, {
    staleTime: 60 * 1000,
  });
}
