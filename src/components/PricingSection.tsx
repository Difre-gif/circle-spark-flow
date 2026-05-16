import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Waves } from '@/components/ui/wave-background';

interface PricingCardProps {
  tier: string;
  price: string;
  units: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
  staggerDelay: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ tier, price, units, features, isPopular, ctaText, ctaLink, staggerDelay }) => {
  return (
    <motion.div
      className={`bg-white/30 rounded-2xl p-8 shadow-lg border border-gray-200 flex flex-col ${isPopular ? 'border-2 border-[#00C853] relative transform scale-105' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: staggerDelay, duration: 0.5 }}
    >
      {isPopular && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00C853] text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md">
          Most Popular
        </span>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier}</h3>
      <p className="text-5xl font-extrabold text-gray-900 mb-2">{price}</p>
      <p className="text-gray-600 text-sm mb-6">{units}</p>

      <ul className="flex-1 space-y-3 mb-8 text-left text-gray-800">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-800">
            <Check size={20} className="text-[#00C853] mr-3 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaLink}
        className={`w-full text-center py-3 rounded-full font-semibold transition-colors duration-300 ${isPopular ? 'bg-[#00C853] text-white hover:bg-green-600' : 'bg-gray-100 text-bizrent-navy dark:text-white hover:bg-gray-200 border border-gray-300'}`}
      >
        {ctaText}
      </a>
    </motion.div>
  );
};

const PricingSection: React.FC = () => {
  const pricingTiers = [
    {
      tier: 'Starter',
      price: 'Free',
      units: 'Forever, up to 5 units',
      features: [
        'Up to 5 units',
        'MoMo payment queue',
        'Auto PDF receipts',
        'Basic dashboard',
        'Email support',
      ],
      ctaText: 'Get started free',
      ctaLink: '/register',
    },
    {
      tier: 'Growth',
      price: 'RWF 15,000/month',
      units: 'Up to 50 units',
      features: [
        'Everything in Starter',
        'SMS & WhatsApp alerts',
        'One-click PDF/CSV reports',
        'Property manager accounts',
        'Partial payments support',
        'Priority support',
      ],
      isPopular: true,
      ctaText: 'Start free trial',
      ctaLink: '/register',
    },
    {
      tier: 'Portfolio',
      price: 'RWF 35,000/month',
      units: 'Unlimited units & properties',
      features: [
        'Everything in Growth',
        'Full RBAC role management',
        'Automated payment reconciliation',
        'Forecasting & analytics',
        'Webhook API for integrators',
        'Dedicated account manager',
      ],
      ctaText: 'Contact us',
      ctaLink: '/contact',
    },
  ];

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <Waves backgroundColor="#F8FAFC" strokeColor="#00C853" pointerSize={0.8} className="absolute inset-0 z-0 opacity-90" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-5xl font-extrabold text-gray-900 mt-4 leading-tight">
            Simple pricing for every landlord.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
            No setup fees. No contracts. Cancel anytime. Priced for landlords in Rwanda and Kenya — not Silicon Valley.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <PricingCard
              key={index}
              tier={tier.tier}
              price={tier.price}
              units={tier.units}
              features={tier.features}
              isPopular={tier.isPopular}
              ctaText={tier.ctaText}
              ctaLink={tier.ctaLink}
              staggerDelay={0.1 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
