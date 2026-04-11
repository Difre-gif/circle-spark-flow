import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const FinalCtaSection: React.FC = () => {
  return (
    <section id="final-cta" className="relative py-24 bg-white overflow-hidden text-center">
      {/* Hero Background Texture Placeholder */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        {/* Abstract Kigali skyline silhouette + subtle green/gold particle points */}
        <svg viewBox="0 0 1440 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute bottom-0 left-0 w-full h-full">
          <path d="M0 300L0 200C100 220, 200 240, 300 230C400 220, 500 200, 600 190C700 180, 800 170, 900 160C1000 150, 1100 140, 1200 130C1300 120, 1400 110, 1440 100L1440 300L0 300Z" fill="#E0E7EB" opacity="0.2"/>
          <path d="M0 300L0 220C100 240, 200 260, 300 250C400 240, 500 220, 600 210C700 200, 800 190, 900 180C1000 170, 1100 160, 1200 150C1300 140, 1400 130, 1440 120L1440 300L0 300Z" fill="#E0E7EB" opacity="0.1"/>
        </svg>
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/10 to-yellow-50/10"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Headline */}
        <motion.h2
          className="text-6xl font-extrabold text-[#0D1B3E] mb-4 leading-tight"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          Your rent collection.<br/>
          <span className="text-[#00C853]">Finally organised.</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Join the waitlist for early access. The first 100 landlords get<br/>
          3 months of Growth free — no card required.
        </motion.p>

        {/* Email Capture Form */}
        <motion.form
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full sm:w-80 px-5 py-3 rounded-full border border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent transition-all duration-300"
          />
          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-[#00C853] text-white text-lg font-semibold shadow-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center group"
          >
            Join the early access waitlist <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.form>

        {/* Trust Signals */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <span>🔒 No credit card required</span>
          <span>•</span>
          <span>📧 No spam, ever</span>
          <span>•</span>
          <span>🚫 Cancel anytime</span>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCtaSection;
