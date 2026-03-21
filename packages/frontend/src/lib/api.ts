import { initClient, tsRestFetchApi } from '@ts-rest/core';
import { contract } from '@remnant/shared';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';

export const apiClient = initClient(contract, {
  baseUrl: '',
  baseHeaders: {},
  credentials: 'include',
  api: async (args) => {
    const token = useAuthStore.getState().accessToken;

    const headers: Record<string, string> = {};
    if (args.headers) {
      for (const [key, value] of Object.entries(args.headers)) {
        headers[key] = value;
      }
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return tsRestFetchApi({
      ...args,
      headers,
    });
  },
});

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function raise(body: unknown, status: number): never {
  const b = body as { code?: string; message?: string } | null;
  throw new ApiError(b?.message ?? 'An error occurred', b?.code ?? 'UNKNOWN', status);
}
