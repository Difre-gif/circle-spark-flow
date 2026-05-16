import { Link } from 'react-router-dom';

const LINKS = {
  Product: ['Features', 'How it works', 'Pricing', 'Security'],
  Company: ['About', 'Blog', 'Careers'],
  Support: ['Help Centre', 'Contact', 'Privacy Policy', 'Terms of Service'],
};

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-white/8 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-[5px] bg-[#10B981] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5L6.5 12L13 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-base font-bold">
                <span className="text-white">Biz</span>
                <span className="text-[#10B981]">Rent</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-4">
              Stop chasing. Start collecting. Built for landlords in Rwanda and Kenya who are tired of managing rent on WhatsApp.
            </p>
            <p className="text-xs text-white/25">
              📍 Kigali, Rwanda · Nairobi, Kenya · support@bizrent.rw
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">© 2026 BizRent. All rights reserved.</p>
          <p className="text-xs text-white/20 flex items-center gap-1.5">
            <span className="text-[#10B981]">🇷🇼</span>
            Made in East Africa for Rwanda and Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}
