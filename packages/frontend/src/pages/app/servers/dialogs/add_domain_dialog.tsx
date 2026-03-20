import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@remnant/frontend/lib/cn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@remnant/frontend/features/ui/shadcn/dialog';
import { Input } from '@remnant/frontend/features/ui/shadcn/input';
import { Label } from '@remnant/frontend/features/ui/shadcn/label';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@remnant/frontend/features/ui/shadcn/form';
import type { DomainType } from '@remnant/shared';

type AddDomainDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (domain: { domain: string; port: number; type: DomainType }) => void;
  serverPort: number;
};

export function AddDomainDialog({ open, onOpenChange, ...rest }: AddDomainDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog {...{ open, onOpenChange }}>
      <DialogContent>
        <DialogHeader>
          <DialogIcon className={'bg-blue-600/10 text-blue-600'}>
            <Globe className={'size-4'} strokeWidth={2} />
          </DialogIcon>
          <div>
            <DialogTitle>{t('settings.domains.addDomain')}</DialogTitle>
            <DialogDescription>{t('settings.domains.addDomainDescription')}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody>
          <AddDomainForm onAdd={rest.onAdd} serverPort={rest.serverPort} />
        </DialogBody>
        <DialogFooter>
          <Button type={'button'} variant={'secondary'} onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'add-domain'}>
            {t('settings.domains.addDomain')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const addDomainSchema = z.object({
  domain: z
    .string()
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/),
  port: z.coerce.number().min(1024).max(65535),
});

type AddDomainFormValues = z.infer<typeof addDomainSchema>;

type AddDomainFormProps = Pick<AddDomainDialogProps, 'onAdd' | 'serverPort'>;

function AddDomainForm({ onAdd, serverPort }: AddDomainFormProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<DomainType>('http');

  const form = useForm<AddDomainFormValues>({
    resolver: zodResolver(addDomainSchema),
    defaultValues: {
      domain: '',
      port: serverPort,
    },
  });

  const handleSubmit = (data: AddDomainFormValues) => {
    onAdd({ domain: data.domain.trim().toLowerCase(), port: data.port, type });
    form.reset();
    setType('http');
  };

  return (
    <Form {...form}>
      <form id={'add-domain'} className={'space-y-6'} onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name={'domain'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.domains.domainName')}</FormLabel>
              <FormControl>
                <Input type={'text'} placeholder={'play.example.com'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={'grid grid-cols-2 gap-4'}>
          <FormField
            control={form.control}
            name={'port'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.domains.port')}</FormLabel>
                <FormControl>
                  <Input type={'number'} placeholder={'8100'} min={1024} max={65535} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Label>{t('settings.domains.type')}</Label>
            <div className={'flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800'}>
              {(['http', 'tcp'] as Array<DomainType>).map((dt) => (
                <button
                  key={dt}
                  type={'button'}
                  onClick={() => setType(dt)}
                  className={cn(
                    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium uppercase transition-all',
                    type === dt
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                  )}
                >
                  {dt === 'http' ? 'HTTP' : 'TCP'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
