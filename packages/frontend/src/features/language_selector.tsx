import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const persistLocale = useUpdateLocale();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code).then();
    persistLocale(code);
    setIsOpen(false);
  };

  return (
    <div className={'relative'} ref={dropdownRef}>
      <button
        type={'button'}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-all duration-(--duration-fast) hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200',
          isOpen && 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
        )}
        aria-label={'Select language'}
      >
        <Globe className={'size-4'} strokeWidth={2} />
      </button>
      {isOpen && (
        <div
          className={
            'animate-scale-in absolute top-full right-0 mt-2 w-36 origin-top-right rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800'
          }
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type={'button'}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-(--duration-fast)',
                lang.code === i18n.language
                  ? 'bg-green-50 text-green-600'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
              )}
            >
              <span className={'text-base'}>{lang.flag}</span>
              <span className={'flex-1 text-left'}>{lang.name}</span>
              {lang.code === i18n.language && <Check className={'size-3.5 text-green-600'} strokeWidth={2} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LanguageSelectorCompact() {
  const { i18n } = useTranslation();
  const persistLocale = useUpdateLocale();
  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const toggleLanguage = () => {
    const currentIndex = languages.findIndex((l) => l.code === i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextCode = languages[nextIndex].code;
    i18n.changeLanguage(nextCode).then();
    persistLocale(nextCode);
  };

  return (
    <button
      type={'button'}
      onClick={toggleLanguage}
      className={
        'flex size-9 items-center justify-center rounded-lg text-zinc-600 transition-all duration-(--duration-fast) hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
      }
      aria-label={'Toggle language'}
    >
      <span className={'text-sm'}>{currentLang.flag}</span>
    </button>
  );
}

function useUpdateLocale() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateLocale = trpc.users.updateLocale.useMutation();

  return (code: string) => {
    if (isAuthenticated) {
      updateLocale.mutate({ locale: code });
    }
  };
}
