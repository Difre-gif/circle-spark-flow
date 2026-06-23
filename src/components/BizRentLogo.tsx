import { cn } from '@/lib/utils';

interface BizRentLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  theme?: 'light' | 'dark' | 'auto';
}

function TransparentLogo({
  size,
  variant,
  tone = 'dark',
}: Pick<BizRentLogoProps, 'size' | 'variant'> & { tone?: 'light' | 'dark' }) {
  const iconSizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' };
  const textSizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' };
  const markFill = tone === 'dark' ? '#F8FAFC' : '#0F172A';
  const checkOutline = tone === 'dark' ? '#1E3A8A' : '#F8FAFC';
  const bizColor = tone === 'dark' ? 'text-white' : 'text-[#0F172A]';

  return (
    <div className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 48 48"
        role="img"
        aria-label="BizRent"
        className={cn('shrink-0 drop-shadow-sm', iconSizes[size ?? 'md'])}
      >
        <rect x="7" y="7" width="26" height="34" rx="4" fill={markFill} />
        <path d="M15 14h13c5.5 0 9 3.1 9 8 0 2.7-1.1 4.8-3.2 6 2.8 1.1 4.2 3.4 4.2 6.5 0 5.2-3.8 8.5-9.8 8.5H15V14Z" fill={markFill} />
        <path d="M14.5 25.5 20.5 31.5 35.5 16.5" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 25.5 20.5 31.5 35.5 16.5" fill="none" stroke={checkOutline} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {variant !== 'icon' && (
        <span className={cn('font-extrabold leading-none tracking-normal', textSizes[size ?? 'md'])}>
          <span className={bizColor}>Biz</span>
          <span className="text-[#10B981]">Rent</span>
        </span>
      )}
    </div>
  );
}

export function BizRentLogo({ className, size = 'md', variant = 'full', theme = 'auto' }: BizRentLogoProps) {
  const sizes = { sm: 'h-8', md: 'h-10', lg: 'h-14' };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {theme === 'auto' && (
        <>
          {variant === 'icon' ? (
            <>
              <div className="dark:hidden">
                <TransparentLogo size={size} variant="icon" tone="light" />
              </div>
              <div className="hidden dark:flex">
                <TransparentLogo size={size} variant="icon" tone="dark" />
              </div>
            </>
          ) : (
            <img src="/logo-light.png" alt="BizRent" className={cn('dark:hidden object-contain', sizes[size])} />
          )}
          <div className={cn(variant === 'icon' ? 'hidden' : 'hidden dark:flex')}>
            <TransparentLogo size={size} variant={variant} tone="dark" />
          </div>
        </>
      )}
      {theme === 'light' && (
        <img src="/logo-light.png" alt="BizRent" className={cn('object-contain', sizes[size])} />
      )}
      {theme === 'dark' && (
        <TransparentLogo size={size} variant={variant} tone="dark" />
      )}
    </div>
  );
}
