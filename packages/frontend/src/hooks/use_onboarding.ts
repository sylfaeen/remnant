import { useTranslation } from 'react-i18next';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';

export function useNeedsSetup() {
  return trpc.onboarding.needsSetup.useQuery();
}

export function useSetup() {
  const { i18n } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);

  return trpc.onboarding.setup.useMutation({
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      if (data.user.locale) {
        i18n.changeLanguage(data.user.locale).then();
      }
    },
  });
}
