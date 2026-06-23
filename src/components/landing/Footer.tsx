import { Link } from 'react-router-dom';
import { BizRentLogo } from '@/components/BizRentLogo';

const LINKS = [
  {
    title: 'Product',
    items: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Results', href: '#testimonials' },
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
    ],
  },
  {
    title: 'Markets',
    items: [
      { label: 'Kenya landlords', href: '#features' },
      { label: 'Rwanda landlords', href: '#features' },
      { label: 'Property managers', href: '#pricing' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#08111F] py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div>
            <BizRentLogo theme="dark" size="sm" />
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              Rent collection software for landlords and property managers in Rwanda and Kenya.
            </p>
            <p className="mt-4 text-xs font-semibold text-slate-500">Kigali, Rwanda - Nairobi, Kenya</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {LINKS.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      {item.href.startsWith('/') ? (
                        <Link to={item.href} className="text-sm font-semibold text-slate-300 hover:text-white">
                          {item.label}
                        </Link>
                      ) : (
                        <a href={item.href} className="text-sm font-semibold text-slate-300 hover:text-white">
                          {item.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>(c) 2026 BizRent. All rights reserved.</p>
          <p>Built for East African rent collection.</p>
        </div>
      </div>
    </footer>
  );
}
