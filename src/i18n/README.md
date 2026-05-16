# Translation workflow

All new user-facing interface copy should be added to the locale files in `src/i18n/locales/` first, then consumed through `useTranslation()` instead of being hardcoded in components.

Supported interface languages:

- English (`en`)
- Kiswahili (`sw`)
- Kinyarwanda (`rw`)

When adding a new screen or changing existing UI text:

1. Add the English key in `en.ts`.
2. Add the matching Kiswahili and Kinyarwanda keys in `sw.ts` and `rw.ts`.
3. Use `t('section.key')` in the component.
4. Verify the screen in all three languages using the global language switcher.

The global theme switcher is also shared across the app. Prefer semantic tokens such as `bg-background`, `bg-card`, `text-foreground`, and `text-muted-foreground` so both light and dark themes remain readable.
