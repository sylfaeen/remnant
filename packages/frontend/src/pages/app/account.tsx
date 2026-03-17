import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TRPCClientError } from '@trpc/client';
import { ErrorCodes } from '@remnant/shared';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';
import { useTotpStatus, useTotpSetup, useTotpVerify, useTotpDisable } from '@remnant/frontend/hooks/use_totp';
import { TotpSettingsSection, TotpSetupDialog, TotpDisableDialog } from '@remnant/frontend/features/totp/totp_setup_display';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';

export function AccountPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <PageContent>
      <div className={'space-y-6'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight text-zinc-900'}>{t('account.title')}</h1>
          <p className={'mt-1 text-zinc-600'}>{t('account.subtitle', { username: user?.username })}</p>
        </div>
        <TwoFactorSection />
      </div>
    </PageContent>
  );
}

function TwoFactorSection() {
  const { t } = useTranslation();
  const { data: status, refetch: refetchStatus } = useTotpStatus();
  const setup = useTotpSetup();
  const verify = useTotpVerify();
  const disable = useTotpDisable();

  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<Array<string> | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [disableError, setDisableError] = useState<string | null>(null);

  const handleSetupStart = () => {
    setRecoveryCodes(null);
    setVerifyError(null);
    setup.mutate(undefined, {
      onSuccess: () => {
        setSetupDialogOpen(true);
      },
    });
  };

  const handleVerify = (code: string) => {
    setVerifyError(null);
    verify.mutate(
      { code },
      {
        onSuccess: () => {
          setRecoveryCodes(setup.data?.recovery_codes ?? null);
        },
        onError: (error) => {
          if (error instanceof TRPCClientError && error.message === ErrorCodes.TOTP_INVALID_CODE) {
            setVerifyError(t('settings.twoFactor.invalidCode'));
          } else {
            setVerifyError(t('authErrors.generic'));
          }
        },
      }
    );
  };

  const handleDisable = (code: string) => {
    setDisableError(null);
    disable.mutate(
      { code },
      {
        onSuccess: () => {
          setDisableDialogOpen(false);
          refetchStatus().then();
        },
        onError: (error) => {
          if (error instanceof TRPCClientError && error.message === ErrorCodes.TOTP_INVALID_CODE) {
            setDisableError(t('settings.twoFactor.invalidCode'));
          } else {
            setDisableError(t('authErrors.generic'));
          }
        },
      }
    );
  };

  const handleSetupComplete = () => {
    setSetupDialogOpen(false);
    setRecoveryCodes(null);
    refetchStatus().then();
  };

  return (
    <>
      <TotpSettingsSection
        enabled={status?.enabled ?? false}
        onSetupStart={handleSetupStart}
        onDisable={() => setDisableDialogOpen(true)}
        loading={setup.isPending}
      />
      <TotpSetupDialog
        open={setupDialogOpen}
        onOpenChange={setSetupDialogOpen}
        qrCodeUri={setup.data?.qr_code_uri ?? null}
        secret={setup.data?.secret ?? null}
        onVerify={handleVerify}
        onComplete={handleSetupComplete}
        verifyLoading={verify.isPending}
        {...{ recoveryCodes, verifyError }}
      />
      <TotpDisableDialog
        open={disableDialogOpen}
        onOpenChange={setDisableDialogOpen}
        onConfirm={handleDisable}
        error={disableError}
        loading={disable.isPending}
      />
    </>
  );
}
