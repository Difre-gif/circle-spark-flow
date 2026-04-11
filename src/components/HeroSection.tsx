import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

// BackgroundPaths Component
const BackgroundPaths: React.FC = () => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.8, ease: "easeIn" },
        delay: i * 0.3 // Staggered delay
      }
    })
  };

  const paths = [
    "M -50 700 C 200 600, 400 200, 700 150 C 900 110, 1100 400, 1500 300",
    "M 0 500 C 300 400, 600 600, 900 400 C 1100 260, 1300 500, 1500 450",
    "M 200 900 C 400 700, 500 400, 800 300 C 1000 220, 1200 600, 1440 500",
    "M -100 300 C 200 350, 500 100, 750 200 C 950 280, 1200 150, 1550 200",
    "M 100 800 C 350 650, 700 750, 900 550 C 1050 400, 1300 700, 1440 650"
  ];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-40">
      <svg viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="rgba(13,27,62,0.08)"
            strokeWidth={i % 2 === 0 ? "2" : "1.5"}
            fill="none"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
            custom={i}
            transition={{
                duration: 5 + i * 0.5,
                ease: "linear",
                repeat: Infinity,
                repeatType: "reverse"
              }}
          />
        ))}
      </svg>
    </div>
  );
};

const HeroSection: React.FC = () => {
  const sentence = "Stop chasing. Start collecting.";
  const words = sentence.split(" ");

  const charVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 25
      }
    }
  };

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center text-center overflow-hidden bg-white">
      <BackgroundPaths />

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Eyebrow Label */}
        <motion.div
          className="inline-block px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          🇷🇼 Rwanda's First MoMo-First Platform
        </motion.div>

        {/* Main Headline */}
        <h1 className="text-7xl lg:text-8xl extra-bold tracking-tighter text-[#0D1B3E] mb-4 leading-tight">
          <motion.span
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05 }}
            className="block"
          >
            {words[0].split("").map((char, index) => (
              <motion.span key={index} variants={charVariants}>
                {char}
              </motion.span>
            ))}{words[1].split("").map((char, index) => (
                <motion.span key={index} variants={charVariants}>
                    {char}
                </motion.span>
            ))}
          </motion.span>
          <br />
          <motion.span
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05, delayChildren: 0.8 }}
            className="block relative inline-block"
          >
            {words[2].split("").map((char, index) => (
              <motion.span key={index} variants={charVariants}>
                {char}
              </motion.span>
            ))}{words[3].split("").map((char, index) => (
                <motion.span key={index} variants={charVariants}>
                    {char}
                </motion.span>
            ))}
            <motion.span
              className="absolute left-0 bottom-0 h-1 bg-[#00C853]"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
            />
          </motion.span>
        </h1>

        {/* Subheadline */}
        <motion.p
          className="text-xl font-normal text-gray-600 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          BizRent gives every East African landlord a single dashboard to manage properties, verify MTN MoMo payments, and know — with certainty — who has paid and who has not.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
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
            className="px-8 py-3 rounded-full border border-[#0D1B3E] text-[#0D1B3E] text-lg font-medium hover:bg-[#0D1B3E] hover:text-white transition-colors duration-300 flex items-center"
          >
            See how it works ↓
          </a>
        </motion.div>

        {/* Trust Microcopy */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <span className="flex items-center"><Check size={16} className="text-[#00C853] mr-2" /> No WhatsApp chaos</span>
          <span className="flex items-center"><Check size={16} className="text-[#00C853] mr-2" /> MTN MoMo native</span>
          <span className="flex items-center"><Check size={16} className="text-[#00C853] mr-2" /> Instant receipts</span>
        </motion.div>
      </div>

      {/* Hero Image - Placeholder for now */}
      <motion.div
        className="absolute bottom-0 right-0 left-0 w-full flex justify-center lg:relative lg:w-auto lg:flex-none mt-16 lg:mt-0"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.8, ease: "easeOut" }}
      >
        {/* This is a placeholder. A real 3D mockup image will be generated and placed here. */}
        <div className="w-[600px] h-[400px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-600">
          [3D MacBook Pro Mockup Placeholder]
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
