import { cn } from '@/lib/utils';

interface BizRentLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

export function BizRentLogo({ className, size = 'md', variant = 'full' }: BizRentLogoProps) {
  const sizes = { sm: 'h-6', md: 'h-8', lg: 'h-12' };
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizes[size])}
        style={{ aspectRatio: '1' }}
      >
        {/* Building shape */}
        <rect x="4" y="8" width="20" height="28" rx="2" fill="currentColor" opacity="0.9" />
        <rect x="8" y="12" width="4" height="4" rx="1" fill="white" opacity="0.8" />
        <rect x="16" y="12" width="4" height="4" rx="1" fill="white" opacity="0.8" />
        <rect x="8" y="20" width="4" height="4" rx="1" fill="white" opacity="0.8" />
        <rect x="16" y="20" width="4" height="4" rx="1" fill="white" opacity="0.8" />
        <rect x="10" y="28" width="8" height="8" rx="1" fill="white" opacity="0.6" />
        {/* Key shape overlay */}
        <circle cx="32" cy="14" r="6" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <circle cx="32" cy="14" r="2" fill="currentColor" />
        <line x1="32" y1="20" x2="32" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="28" x2="36" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="32" x2="36" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {variant === 'full' && (
        <span className={cn('font-bold tracking-tight', textSizes[size])}>
          Biz<span className="text-bizrent-blue">Rent</span>
        </span>
      )}
    </div>
  );
}
