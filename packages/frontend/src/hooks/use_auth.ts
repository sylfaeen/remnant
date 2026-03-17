import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TRPCClientError } from '@trpc/client';
import type { TFunction } from 'i18next';
import { ErrorCodes } from '@remnant/shared';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';

export function useLogin(onTotpRequired?: (totpToken: string) => void) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return trpc.auth.login.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      if ('requires_totp' in data && data.requires_totp) {
        setLoading(false);
        onTotpRequired?.(data.totp_token);
        return;
      }

      if ('access_token' in data) {
        setAuth(data.user, data.access_token);
        if (data.user.locale) {
          i18n.changeLanguage(data.user.locale).then();
        }
        navigate({ to: '/app' }).then();
      }
    },
    onError: () => {
      setLoading(false);
    },
  });
}

export function useVerifyTotpLogin() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);

  return trpc.auth.verifyTotp.useMutation({
    onSuccess: (data) => {
      if ('access_token' in data && 'user' in data) {
        const result = data as {
          access_token: string;
          user: { id: number; username: string; permissions: Array<string>; locale: string | null };
        };
        setAuth(result.user, result.access_token);
        if (result.user.locale) {
          i18n.changeLanguage(result.user.locale).then();
        }
        navigate({ to: '/app' }).then();
      }
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return trpc.auth.logout.useMutation({
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate({ to: '/' }).then();
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
      navigate({ to: '/' }).then();
    },
  });
}

export function useRefreshToken() {
  const { i18n } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  return trpc.auth.refresh.useMutation({
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      if (data.user.locale) {
        i18n.changeLanguage(data.user.locale).then();
      }
      setInitialized(true);
    },
    onError: () => {
      clearAuth();
      setInitialized(true);
    },
  });
}

export function useUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  return trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated && !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function getAuthErrorMessage(error: Error | null, t: TFunction): string | null {
  if (!error) return null;

  if (error instanceof TRPCClientError) {
    const message = error.message;

    switch (message) {
      case ErrorCodes.AUTH_INVALID_CREDENTIALS:
        return t('authErrors.invalidCredentials');
      case ErrorCodes.AUTH_TOKEN_EXPIRED:
        return t('authErrors.tokenExpired');
      case ErrorCodes.AUTH_TOKEN_INVALID:
        return t('authErrors.tokenInvalid');
      case ErrorCodes.AUTH_UNAUTHORIZED:
        return t('authErrors.unauthorized');
      case ErrorCodes.TOTP_INVALID_CODE:
        return t('authErrors.totpInvalidCode');
      case ErrorCodes.TOTP_ALREADY_ENABLED:
        return t('authErrors.totpAlreadyEnabled');
      case ErrorCodes.TOTP_NOT_ENABLED:
        return t('authErrors.totpNotEnabled');
      default:
        break;
    }

    const code = error.data?.code;
    switch (code) {
      case 'BAD_REQUEST':
        return t('authErrors.badRequest');
      case 'TOO_MANY_REQUESTS':
        return t('authErrors.tooManyRequests');
      default:
        return t('authErrors.generic');
    }
  }

  return t('authErrors.generic');
}
