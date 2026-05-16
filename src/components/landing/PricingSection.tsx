import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TIERS = [
  {
    name: 'STARTER',
    badge: 'For individual landlords',
    monthlyPrice: 15000,
    annualPrice: 150000,
    priceSub: 'per month',
    highlight: false,
    border: 'border-[#E2E8F0]',
    features: [
      'Up to 15 units',
      'Up to 3 properties',
      'MoMo payment queue',
      'Automated PDF receipts',
      'Basic monthly reports',
      '1 manager account',
      '30-day free trial',
    ],
    cta: 'Start free — 30 days',
    ctaTo: '/register',
    ctaStyle: 'bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white',
  },
  {
    name: 'GROWTH',
    badge: 'Most popular',
    monthlyPrice: 35000,
    annualPrice: 350000,
    priceSub: 'per month',
    highlight: true,
    border: 'border-[#1D4ED8]',
    features: [
      'Up to 60 units',
      'Up to 15 properties',
      'Everything in Starter',
      'WhatsApp notifications',
      'Kinyarwanda interface',
      'Advanced reports',
      '3 manager accounts',
      'Priority support',
    ],
    cta: 'Start free — 30 days',
    ctaTo: '/register',
    ctaStyle: 'bg-white text-[#1E3A8A] hover:bg-[#F8FAFC]',
  },
  {
    name: 'PRO',
    badge: 'For property companies',
    monthlyPrice: 80000,
    annualPrice: 800000,
    priceSub: 'per month',
    highlight: false,
    border: 'border-[#F59E0B]/50',
    features: [
      'Unlimited units',
      'Unlimited properties',
      'Everything in Growth',
      'Full API access',
      'Revenue forecasting',
      'Unlimited managers',
      'Onboarding call',
      'Dedicated support',
    ],
    cta: 'Talk to us first',
    ctaTo: 'https://wa.me/250700000000',
    ctaStyle: 'bg-[#F59E0B]/10 text-[#92400E] hover:bg-[#F59E0B]/20 border border-[#F59E0B]/40',
  },
];

function formatRWF(n: number) {
  return `RWF ${n.toLocaleString('en-US')}`;
}

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative bg-[#0F172A] py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B981] mb-4 block"
          >
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          >
            Priced for Kigali and Nairobi.
          </motion.h2>

          {/* ROI framing */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto mb-8"
          >
            <p className="text-white/60 text-base leading-relaxed">
              A landlord managing 10 units at RWF 100,000 each earns{' '}
              <span className="text-white font-semibold">RWF 1,000,000 a month.</span>
            </p>
            <p className="text-[#10B981] font-semibold text-base mt-1">
              BizRent Starter costs 1.5% of that. One prevented fraud pays for a year.
            </p>
          </motion.div>

          {/* Monthly / Annual toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 bg-white/8 border border-white/10 rounded-full px-2 py-1.5"
          >
            <span className="text-sm font-medium text-white/60 px-2">Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-10 h-5 rounded-full transition-colors duration-200"
              style={{ background: annual ? '#10B981' : '#334155' }}
              aria-label="Toggle annual pricing"
            >
              <motion.div
                animate={{ x: annual ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </button>
            <span className={`text-sm font-medium px-2 ${annual ? 'text-[#10B981]' : 'text-white/60'}`}>
              Annual{' '}
              {annual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-1 text-xs bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full font-bold"
                >
                  Save 17%
                </motion.span>
              )}
            </span>
          </motion.div>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-[8px] border ${tier.border} flex flex-col overflow-hidden ${
                tier.highlight ? 'ring-2 ring-[#1D4ED8]' : ''
              }`}
              style={{
                background: tier.highlight ? '#1E3A8A' : 'rgba(30,41,59,0.7)',
                backdropFilter: 'blur(16px)',
                marginTop: tier.highlight ? 0 : 0,
                boxShadow: tier.highlight ? '0 0 0 1px #1D4ED8, 0 20px 60px rgba(29,78,216,0.2)' : undefined,
              }}
            >
              {tier.highlight && (
                <motion.div
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-[8px] border-2 border-[#1D4ED8] pointer-events-none"
                />
              )}

              <div className="p-6 flex-1 flex flex-col">
                {/* Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                    {tier.name}
                  </span>
                  {tier.highlight ? (
                    <span className="text-xs font-bold bg-[#10B981] text-white px-2.5 py-0.5 rounded-full">
                      {tier.badge}
                    </span>
                  ) : (
                    <span className="text-xs text-white/40">{tier.badge}</span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={annual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div
                        className="text-3xl font-bold text-white font-mono leading-none"
                        style={{ fontFamily: 'Inter Mono, Courier New, monospace' }}
                      >
                        {formatRWF(annual ? Math.round(tier.annualPrice / 12) : tier.monthlyPrice)}
                      </div>
                      <div className="text-xs text-white/40 mt-1">
                        {annual
                          ? `billed annually — ${formatRWF(tier.annualPrice)}/yr`
                          : 'billed monthly'}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className="h-4 w-4 flex-shrink-0 mt-0.5"
                        style={{ color: tier.highlight ? '#10B981' : '#10B981' }}
                      />
                      <span className={tier.highlight ? 'text-white/80' : 'text-white/60'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {tier.ctaTo.startsWith('http') ? (
                  <a
                    href={tier.ctaTo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center py-3 rounded-[6px] font-semibold text-sm transition-colors ${tier.ctaStyle}`}
                  >
                    {tier.cta}
                  </a>
                ) : (
                  <Link
                    to={tier.ctaTo}
                    className={`group block text-center py-3 rounded-[6px] font-semibold text-sm transition-colors ${tier.ctaStyle} relative overflow-hidden`}
                  >
                    <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                    {tier.cta}
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-white/30 mt-10 max-w-lg mx-auto leading-relaxed"
        >
          All plans start with a 30-day free trial. No credit card. No commitment.{' '}
          <span className="text-white/50">Your data stays with you forever — even if you don't subscribe.</span>
        </motion.p>
      </div>
    </section>
  );
}
