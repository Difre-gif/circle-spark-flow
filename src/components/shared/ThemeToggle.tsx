import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-10 w-10 rounded-full border-border/70 bg-card/80 shadow-sm backdrop-blur"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? t('ui.lightMode') : t('ui.darkMode')}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </Button>
  );
}
