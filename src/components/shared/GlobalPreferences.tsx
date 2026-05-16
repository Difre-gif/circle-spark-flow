import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

export function GlobalPreferences() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-border/70 bg-card/75 p-1.5 shadow-lg shadow-black/10 backdrop-blur-md">
      <LanguageToggle />
      <ThemeToggle />
    </div>
  );
}
