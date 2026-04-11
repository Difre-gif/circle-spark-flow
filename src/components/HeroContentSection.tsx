import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const HeroContentSection: React.FC = () => {
  return (
    <section className="relative z-10 py-16 bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Eyebrow Label */}
        <motion.div
          className="inline-block px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          🇷🇼 Rwanda's First MoMo-First Platform
        </motion.div>

        {/* Subheadline */}
        <motion.p
          className="text-xl font-normal text-gray-600 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          BizRent gives every East African landlord a single dashboard to manage properties, verify MTN MoMo payments, and know — with certainty — who has paid and who has not.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link
            to="/register"
            className="px-8 py-3 rounded-full bg-[#00C853] text-white text-lg font-medium shadow-lg hover:bg-green-600 transition-colors duration-300 flex items-center group"
            style={{ animation: 'pulse 2s infinite' }}
          >
            Get early access — it's free <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <a
            href="#how"
            className="px-8 py-3 rounded-full border border-gray-300 text-bizrent-navy text-lg font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors duration-300 flex items-center"
          >
            See how it works ↓
          </a>
        </motion.div>

        {/* Trust Microcopy */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <span className="flex items-center"><Check size={16} className="text-[#00C853] mr-2" /> No WhatsApp chaos</span>
          <span className="flex items-center"><Check size={16} className="text-[#00C853] mr-2" /> MTN MoMo native</span>
          <span className="flex items-center"><Check size={16} className="text-[#00C853] mr-2" /> Instant receipts</span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroContentSection;
