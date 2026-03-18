import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { Button } from '@remnant/frontend/features/ui/button';
import { Input, InputGroup } from '@remnant/frontend/features/ui/input';
import { OtpInput } from '@remnant/frontend/features/ui/otp_input';

type TotpLoginStepProps = {
  onVerify: (code: string) => void;
  onBack: () => void;
  error?: string | null;
  loading?: boolean;
};

export function TotpLoginStep({ onVerify, onBack, error, loading }: TotpLoginStepProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);

  const handleSubmit = () => {
    if (code.length > 0) {
      onVerify(code);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length > 0) {
      handleSubmit();
    }
  };

  const canSubmit = useRecovery ? code.length > 0 : code.length === 6;

  return (
    <div className={'animate-fade-in'}>
      <div className={'shadow-card rounded-xl border border-black/10 bg-white p-6'}>
        <div className={'mb-5 flex flex-col items-center text-center'}>
          <div className={'mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-600/10'}>
            {useRecovery ? (
              <KeyRound className={'size-6 text-emerald-600'} strokeWidth={1.75} />
            ) : (
              <ShieldCheck className={'size-6 text-emerald-600'} strokeWidth={1.75} />
            )}
          </div>
          <h2 className={'text-lg font-semibold text-zinc-900'}>{t('auth.totp.title')}</h2>
          <p className={'mt-1 text-sm text-zinc-500'}>
            {useRecovery ? t('auth.totp.recoverySubtitle') : t('auth.totp.subtitle')}
          </p>
        </div>
        <div className={'space-y-4'}>
          {error && (
            <div className={'flex items-center gap-2.5 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600'}>
              <AlertCircle className={'size-4 shrink-0'} />
              <span>{error}</span>
            </div>
          )}
          <InputGroup label={useRecovery ? t('auth.totp.recoveryCodeLabel') : t('auth.totp.codeLabel')}>
            {useRecovery ? (
              <Input
                type={'text'}
                inputMode={'text'}
                autoComplete={'off'}
                autoFocus
                maxLength={32}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('auth.totp.recoveryCodePlaceholder')}
              />
            ) : (
              <OtpInput
                value={code}
                length={6}
                onChange={setCode}
                onComplete={(completed) => onVerify(completed)}
                error={!!error}
                disabled={loading}
              />
            )}
          </InputGroup>
          <Button size={'md'} onClick={handleSubmit} disabled={!canSubmit} className={'w-full'} {...{ loading }}>
            {loading ? t('common.loading') : t('auth.totp.verify')}
          </Button>
          <div className={'flex justify-center'}>
            <Button
              variant={'link'}
              size={'sm'}
              onClick={() => {
                setUseRecovery(!useRecovery);
                setCode('');
              }}
              className={'text-zinc-500 no-underline hover:text-zinc-700 dark:hover:text-zinc-300'}
            >
              {useRecovery ? t('auth.totp.useAuthenticator') : t('auth.totp.useRecoveryCode')}
            </Button>
          </div>
        </div>
      </div>
      <div className={'mt-4 flex justify-center'}>
        <Button
          variant={'ghost'}
          size={'sm'}
          onClick={onBack}
          className={'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}
        >
          <ArrowLeft className={'size-3.5'} />
          {t('auth.totp.back')}
        </Button>
      </div>
    </div>
  );
}
