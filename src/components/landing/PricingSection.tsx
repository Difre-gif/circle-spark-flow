import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const TIERS = [
  {
    name: 'Starter',
    price: 'RWF 15,000',
    note: 'For individual landlords',
    cta: 'Start free',
    highlight: false,
    features: ['Up to 15 units', 'Payment proof queue', 'Invoices and receipts', 'Basic reports', '1 manager account'],
  },
  {
    name: 'Growth',
    price: 'RWF 35,000',
    note: 'For growing portfolios',
    cta: 'Start free',
    highlight: true,
    features: ['Up to 60 units', 'Everything in Starter', 'Flexible tenant billing', 'Advanced reports', '3 manager accounts'],
  },
  {
    name: 'Portfolio',
    price: 'Custom',
    note: 'For management companies',
    cta: 'Talk to us',
    highlight: false,
    features: ['Unlimited properties', 'Unlimited managers', 'Onboarding support', 'Custom reporting', 'Priority support'],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-[#F8FAFC] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#10B981]">Pricing</p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
            Simple pricing for landlords in Kigali and Nairobi.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Start with the plan that matches your portfolio. Upgrade when the number of properties demands it.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg border p-6 shadow-sm ${
                tier.highlight
                  ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-[#1E3A8A]/20'
                  : 'border-slate-200 bg-white text-slate-950'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={`text-xl font-black ${tier.highlight ? 'text-white' : 'text-slate-950'}`}>{tier.name}</h3>
                  <p className={`mt-1 text-sm ${tier.highlight ? 'text-white/70' : 'text-slate-500'}`}>{tier.note}</p>
                </div>
                {tier.highlight && (
                  <span className="rounded-full bg-[#10B981] px-3 py-1 text-xs font-bold text-[#07111F]">Popular</span>
                )}
              </div>

              <div className="mt-8">
                <p className={`font-mono text-4xl font-black ${tier.highlight ? 'text-white' : 'text-slate-950'}`}>{tier.price}</p>
                <p className={`mt-2 text-sm ${tier.highlight ? 'text-white/60' : 'text-slate-500'}`}>per month, after trial</p>
              </div>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className={`flex gap-3 text-sm ${tier.highlight ? 'text-white/80' : 'text-slate-600'}`}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={tier.name === 'Portfolio' ? '/register' : '/register'}
                className={`mt-8 inline-flex min-h-[46px] w-full items-center justify-center rounded-md px-4 text-sm font-extrabold ${
                  tier.highlight
                    ? 'bg-white text-[#1E3A8A] hover:bg-slate-100'
                    : 'bg-[#1E3A8A] text-white hover:bg-[#1D4ED8]'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
