import { useState, useEffect, type SubmitEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { TRPCClientError } from '@trpc/client';
import { ErrorCodes } from '@remnant/shared';
import { useLogin, useVerifyTotpLogin, getAuthErrorMessage } from '@remnant/frontend/hooks/use_auth';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';
import { BrandPanel } from '@remnant/frontend/pages/web/features/brand_panel';
import { TotpLoginStep } from '@remnant/frontend/features/totp/totp_login_step';
import { Button } from '@remnant/frontend/features/ui/button';
import { Input, InputGroup } from '@remnant/frontend/features/ui/input';

type LoginStep = 'credentials' | 'totp';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<LoginStep>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState<string | null>(null);
  const [totpError, setTotpError] = useState<string | null>(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const login = useLogin((token) => {
    setTotpToken(token);
    setStep('totp');
  });

  const verifyTotp = useVerifyTotpLogin();
  const errorMessage = getAuthErrorMessage(login.error as Error | null, t);

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      navigate({ to: '/' }).then();
    }
  }, [isAuthenticated, isInitialized, navigate]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  const handleTotpVerify = (code: string) => {
    if (!totpToken) return;
    setTotpError(null);
    verifyTotp.mutate(
      { totp_token: totpToken, code },
      {
        onError: (error) => {
          if (error instanceof TRPCClientError) {
            if (error.message === ErrorCodes.TOTP_INVALID_CODE) {
              setTotpError(t('auth.totp.invalidCode'));
            } else if (error.message === ErrorCodes.AUTH_TOKEN_EXPIRED) {
              setTotpError(t('auth.totp.sessionExpired'));
              setStep('credentials');
              setTotpToken(null);
            } else {
              setTotpError(t('authErrors.generic'));
            }
          } else {
            setTotpError(t('authErrors.generic'));
          }
        },
      }
    );
  };

  const handleTotpBack = () => {
    setStep('credentials');
    setTotpToken(null);
    setTotpError(null);
  };

  return (
    <div className={'flex min-h-screen'}>
      <BrandPanel />
      <div className={'flex w-full flex-col items-center justify-center bg-gray-100/80 p-6 lg:w-1/2 lg:p-12 dark:bg-zinc-900'}>
        <div className={'w-full max-w-120'}>
          {step === 'credentials' && (
            <>
              <div className={'mb-8 flex flex-col items-center lg:hidden'}>
                <div
                  className={
                    'mb-4 flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-amber-500 shadow-sm'
                  }
                >
                  <span className={'text-lg font-bold text-white'}>R</span>
                </div>
                <h1 className={'text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'}>{t('auth.welcome')}</h1>
                <p className={'mt-1 text-sm text-zinc-500 dark:text-zinc-400'}>{t('auth.subtitle')}</p>
              </div>
              <div className={'hidden lg:block'}>
                <h1 className={'text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'}>{t('auth.welcome')}</h1>
                <p className={'mt-1 mb-8 text-sm text-zinc-500 dark:text-zinc-400'}>{t('auth.subtitle')}</p>
              </div>
              <div className={'shadow-card rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-800'}>
                <form onSubmit={handleSubmit} className={'space-y-4'}>
                  {errorMessage && (
                    <div
                      className={
                        'flex items-center gap-2.5 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-950'
                      }
                    >
                      <AlertCircle className={'size-4 shrink-0'} />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  <InputGroup label={t('auth.username')}>
                    <Input
                      id={'username'}
                      type={'text'}
                      autoComplete={'username'}
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('auth.username')}
                    />
                  </InputGroup>
                  <InputGroup label={t('auth.password')}>
                    <Input
                      id={'password'}
                      type={'password'}
                      autoComplete={'current-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.password')}
                    />
                  </InputGroup>
                  <Button type={'submit'} size={'md'} loading={login.isPending} className={'w-full'}>
                    {login.isPending ? t('auth.loggingIn') : t('auth.loginButton')}
                  </Button>
                </form>
              </div>
            </>
          )}
          {step === 'totp' && (
            <TotpLoginStep onVerify={handleTotpVerify} onBack={handleTotpBack} error={totpError} loading={verifyTotp.isPending} />
          )}
        </div>
      </div>
    </div>
  );
}
