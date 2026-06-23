import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BizRentLogo } from '@/components/BizRentLogo';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Results', href: '#testimonials' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAnchor = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-200',
        scrolled ? 'border-b border-white/10 bg-[#08111F]/90 backdrop-blur-xl' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="BizRent home">
          <BizRentLogo theme="dark" size="sm" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleAnchor(event, link.href)}
              className="text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-[#10B981] px-4 py-2 text-sm font-bold text-[#07111F] shadow-sm transition-colors hover:bg-[#34D399]"
          >
            Start free
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-white/10 text-white md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#08111F] px-4 pb-5 pt-2 md:hidden">
          <nav className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleAnchor(event, link.href)}
                className="rounded-md px-2 py-3 text-base font-semibold text-white/80 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid gap-3">
            <Link to="/login" className="rounded-md border border-white/10 px-4 py-3 text-center font-semibold text-white">
              Sign in
            </Link>
            <Link to="/register" className="rounded-md bg-[#10B981] px-4 py-3 text-center font-bold text-[#07111F]">
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
