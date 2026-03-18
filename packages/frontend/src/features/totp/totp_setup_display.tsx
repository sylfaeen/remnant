import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Download, AlertTriangle, Shield, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { Button } from '@remnant/frontend/features/ui/button';
import { InputGroup } from '@remnant/frontend/features/ui/input';
import { OtpInput } from '@remnant/frontend/features/ui/otp_input';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { cn } from '@remnant/frontend/lib/cn';
import { copyToClipboard } from '@remnant/frontend/lib/copy';
import { Badge } from '@remnant/frontend/features/ui/badge';

type TotpQrDisplayProps = {
  qrCodeUri: string;
  secret: string;
};

export function TotpQrDisplay({ qrCodeUri, secret }: TotpQrDisplayProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') ?? secret;

  const handleCopy = async () => {
    await copyToClipboard(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={'grid gap-5 sm:grid-cols-2'}>
      <div className={'flex flex-col items-center gap-3 rounded-lg border border-black/10 bg-zinc-50 p-5'}>
        <div className={'rounded-lg bg-white p-3 shadow-sm'}>
          <div className={'flex size-40 items-center justify-center'}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrCodeUri)}`}
              alt={'QR Code'}
              className={'size-40'}
            />
          </div>
        </div>
        <p className={'text-center text-xs text-zinc-500'}>{t('settings.twoFactor.scanQr')}</p>
      </div>
      <div className={'flex flex-col gap-3 rounded-lg border border-black/10 bg-zinc-50 p-5'}>
        <p className={'text-sm font-medium text-zinc-900'}>{t('settings.twoFactor.manualEntry')}</p>
        <p className={'text-xs text-zinc-500'}>{t('settings.twoFactor.manualEntryHint')}</p>
        <div className={'mt-auto rounded-lg border border-black/10 bg-white p-3'}>
          <code className={'font-jetbrains block text-center text-base font-semibold tracking-widest text-zinc-900'}>
            {formattedSecret}
          </code>
        </div>
        <Button variant={'secondary'} size={'sm'} onClick={handleCopy} className={'w-full'}>
          {copied ? (
            <>
              <Check className={'size-3.5 text-green-600'} />
              {t('settings.twoFactor.copied')}
            </>
          ) : (
            <>
              <Copy className={'size-4'} />
              {t('settings.twoFactor.copy')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

type TotpCodeInputProps = {
  code: string;
  onChange: (code: string) => void;
  onSubmit: (code: string) => void;
  error?: string | null;
  loading?: boolean;
};

export function TotpCodeInput({ code, onChange, onSubmit, error, loading }: TotpCodeInputProps) {
  const { t } = useTranslation();

  return (
    <div className={'space-y-3'}>
      <InputGroup label={t('settings.twoFactor.enterCode')} error={error ?? undefined}>
        <OtpInput value={code} length={6} onComplete={onSubmit} error={!!error} disabled={loading} {...{ onChange }} />
      </InputGroup>
      <Button size={'md'} onClick={() => onSubmit(code)} disabled={code.length !== 6} className={'w-full'} {...{ loading }}>
        {loading ? t('common.loading') : t('settings.twoFactor.verify')}
      </Button>
    </div>
  );
}

type RecoveryCodesDisplayProps = {
  codes: Array<string>;
  onDone: () => void;
};

export function RecoveryCodesDisplay({ codes, onDone }: RecoveryCodesDisplayProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    await copyToClipboard(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = [
      'Remnant — Recovery Codes',
      '═'.repeat(32),
      '',
      ...codes,
      '',
      'Each code can only be used once.',
      `Generated: ${new Date().toISOString().split('T')[0]}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'remnant-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={'space-y-4'}>
      <div className={'flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3'}>
        <AlertTriangle className={'mt-0.5 size-4 shrink-0 text-amber-600'} />
        <p className={'text-sm text-amber-800'}>{t('settings.twoFactor.recoveryCodes.warning')}</p>
      </div>
      <div className={'rounded-lg border border-black/10 bg-zinc-50 p-4'}>
        <div className={'grid grid-cols-2 gap-2'}>
          {codes.map((code, i) => (
            <div
              key={i}
              className={
                'font-jetbrains rounded border border-black/10 bg-white px-3 py-2 text-center text-sm font-medium text-zinc-900'
              }
            >
              {code}
            </div>
          ))}
        </div>
      </div>
      <div className={'flex gap-2'}>
        <Button variant={'secondary'} size={'sm'} onClick={handleCopyAll} className={'flex-1'}>
          {copied ? (
            <>
              <Check className={'size-3.5 text-green-600'} />
              {t('settings.twoFactor.copied')}
            </>
          ) : (
            <>
              <Copy className={'size-4'} />
              {t('settings.twoFactor.recoveryCodes.copyAll')}
            </>
          )}
        </Button>
        <Button variant={'secondary'} size={'sm'} onClick={handleDownload} className={'flex-1'}>
          <Download className={'size-4'} />
          {t('settings.twoFactor.recoveryCodes.download')}
        </Button>
      </div>
      <Button size={'md'} onClick={onDone} className={'w-full'}>
        {t('settings.twoFactor.recoveryCodes.saved')}
      </Button>
    </div>
  );
}

type TotpSettingsSectionProps = {
  enabled: boolean;
  onSetupStart: () => void;
  onDisable: () => void;
  loading?: boolean;
};

export function TotpSettingsSection({ enabled, onSetupStart, onDisable, loading }: TotpSettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className={'overflow-hidden rounded-xl border border-black/10 bg-white'}>
      <div className={'border-b border-black/10 p-5'}>
        <div className={'flex items-center gap-3'}>
          <div
            className={cn('flex size-10 items-center justify-center rounded-full', enabled ? 'bg-green-600/10' : 'bg-zinc-100')}
          >
            {enabled ? (
              <ShieldCheck className={'size-5 text-green-600'} strokeWidth={2} />
            ) : (
              <Shield className={'size-5 text-zinc-400'} strokeWidth={2} />
            )}
          </div>
          <div className={'flex-1'}>
            <h2 className={'font-semibold text-zinc-900'}>{t('settings.twoFactor.title')}</h2>
            <p className={'text-sm text-zinc-600 dark:text-zinc-400'}>
              {enabled ? t('settings.twoFactor.enabled') : t('settings.twoFactor.disabled')}
            </p>
          </div>
          {enabled && (
            <Badge variant={'success'} size={'md'} className={'text-xs'}>
              {t('settings.twoFactor.activeBadge')}
            </Badge>
          )}
        </div>
      </div>
      <div className={'p-5'}>
        {enabled ? (
          <div className={'space-y-4'}>
            <p className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.twoFactor.enabledDescription')}</p>
            <Button variant={'outline'} size={'sm'} onClick={onDisable} {...{ loading }}>
              <ShieldOff className={'size-4'} />
              {t('settings.twoFactor.disable')}
            </Button>
          </div>
        ) : (
          <div className={'space-y-4'}>
            <p className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.twoFactor.disabledDescription')}</p>
            <Button size={'sm'} onClick={onSetupStart} {...{ loading }}>
              <Shield className={'size-4'} />
              {t('settings.twoFactor.enable')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

type TotpSetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeUri: string | null;
  secret: string | null;
  recoveryCodes: Array<string> | null;
  onVerify: (code: string) => void;
  onComplete: () => void;
  verifyError?: string | null;
  verifyLoading?: boolean;
};

export function TotpSetupDialog({
  open,
  onOpenChange,
  qrCodeUri,
  secret,
  recoveryCodes,
  onVerify,
  onComplete,
  verifyError,
  verifyLoading,
}: TotpSetupDialogProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');

  const showRecovery = !!recoveryCodes;
  const showSetup = !showRecovery && !!qrCodeUri && !!secret;

  return (
    <Dialog {...{ open, onOpenChange }}>
      <Dialog.Content className={'max-w-xl'}>
        <Dialog.Header>
          <Dialog.Title>
            {showRecovery ? t('settings.twoFactor.recoveryCodes.title') : t('settings.twoFactor.setupTitle')}
          </Dialog.Title>
          <Dialog.Description>
            {showRecovery ? t('settings.twoFactor.recoveryCodes.subtitle') : t('settings.twoFactor.setupDescription')}
          </Dialog.Description>
        </Dialog.Header>
        <div className={'mt-5'}>
          {showSetup && (
            <div className={'space-y-5'}>
              <TotpQrDisplay {...{ qrCodeUri, secret }} />
              <div className={'border-t border-black/10 pt-5'}>
                <TotpCodeInput onChange={setCode} onSubmit={onVerify} error={verifyError} loading={verifyLoading} {...{ code }} />
              </div>
            </div>
          )}
          {showRecovery && (
            <RecoveryCodesDisplay
              codes={recoveryCodes}
              onDone={() => {
                onComplete();
                onOpenChange(false);
              }}
            />
          )}
          {!showSetup && !showRecovery && (
            <div className={'flex items-center justify-center py-8'}>
              <Loader2 className={'size-6 animate-spin text-zinc-400'} />
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

type TotpDisableDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (code: string) => void;
  error?: string | null;
  loading?: boolean;
};

export function TotpDisableDialog({ open, onOpenChange, onConfirm, error, loading }: TotpDisableDialogProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');

  return (
    <Dialog {...{ open, onOpenChange }}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t('settings.twoFactor.disableTitle')}</Dialog.Title>
          <Dialog.Description>{t('settings.twoFactor.disableConfirm')}</Dialog.Description>
        </Dialog.Header>
        <div className={'mt-5'}>
          <TotpCodeInput onChange={setCode} onSubmit={onConfirm} {...{ code, error, loading }} />
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
