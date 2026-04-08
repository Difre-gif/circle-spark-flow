import { cn } from '@/lib/utils';

interface BizRentLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon'; // Not strictly followed for the static image, but we'll scale it
  theme?: 'light' | 'dark' | 'auto';
}

export function BizRentLogo({ className, size = 'md', theme = 'auto' }: BizRentLogoProps) {
  // We'll map the sizes to heights that fit the wordmark well
  const sizes = { sm: 'h-6', md: 'h-8', lg: 'h-12' };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {theme === 'auto' && (
        <>
          <img src="/logo-light.png" alt="BizRent" className={cn('dark:hidden object-contain', sizes[size])} />
          <img src="/logo-dark.png" alt="BizRent" className={cn('hidden dark:block object-contain', sizes[size])} />
        </>
      )}
      {theme === 'light' && (
        <img src="/logo-light.png" alt="BizRent" className={cn('object-contain', sizes[size])} />
      )}
      {theme === 'dark' && (
        <img src="/logo-dark.png" alt="BizRent" className={cn('object-contain', sizes[size])} />
      )}
    </div>
  );
}
