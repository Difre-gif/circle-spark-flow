import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageToggle() {
  const { t, i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-border/70 bg-card/80 shadow-sm backdrop-blur"
          aria-label={t('ui.language')}
        >
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>{t('ui.language')}</DropdownMenuLabel>
        {supportedLanguages.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => i18n.changeLanguage(language.code)}
            className={i18n.resolvedLanguage === language.code ? 'font-semibold text-primary' : undefined}
          >
            {language.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
