import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  const [showCollecting, setShowCollecting] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
    exit: { opacity: 0, transition: { duration: 0.4 } },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 14, stiffness: 120 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowCollecting(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#F8FAFC]">
      {/* Subtle grid pattern — brand-compliant, no gradients */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#1E3A8A 1px, transparent 1px), linear-gradient(90deg, #1E3A8A 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Animated headline */}
        <AnimatePresence mode="wait">
          {!showCollecting ? (
            <motion.h1
              key="stop-chasing"
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#0F172A] mb-6 leading-[1.1]"
              style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 700 }}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {'STOP CHASING.'.split(' ').map((word, i) => (
                <motion.span key={i} variants={wordVariants} className="inline-block mr-4">
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          ) : (
            <motion.h1
              key="start-collecting"
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#1D4ED8] mb-6 leading-[1.1]"
              style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 700 }}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {'START COLLECTING.'.split(' ').map((word, i) => (
                <motion.span key={i} variants={wordVariants} className="inline-block mr-4">
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Sub-headline */}
        <motion.p
          className="text-lg md:text-xl text-[#0F172A]/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 400 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          BizRent gives every landlord in Rwanda a single dashboard to track properties, verify MoMo
          payments, and know exactly who has paid — and who has not.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white font-semibold text-sm px-6 py-3 rounded-[6px] transition-colors"
            style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 600, fontSize: '14px' }}
          >
            Start free — no card needed
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/how-it-works"
            className="inline-flex items-center justify-center gap-2 bg-transparent border border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF] font-semibold text-sm px-6 py-3 rounded-[6px] transition-colors"
            style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 600, fontSize: '14px' }}
          >
            See how it works
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
