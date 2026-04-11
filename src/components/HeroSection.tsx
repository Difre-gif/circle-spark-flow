import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

import { SpiralAnimation } from '@/components/ui/spiral-animation';

const HeroSection: React.FC = () => {
  const [showCollecting, setShowCollecting] = useState(false);

  const words1 = "STOP CHASING.".split(" ");
  const words2 = "START COLLECTING.".split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.04 * i },
    }),
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 10, stiffness: 100 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCollecting(true);
    }, 5000); // Adjust delay as needed for spiral animation to complete
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0">
        <img src="/hero-background.png" alt="Hero Background" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <div className="relative z-10 text-center text-black"> {/* Changed text color to black */}
        <AnimatePresence mode="wait">
          {!showCollecting ? (
            <motion.h1
              key="stop-chasing"
              className="text-6xl md:text-7xl lg:text-8xl mb-4 leading-tight font-pacifico" /* Changed font to Pacifico */
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {words1.map((word, index) => (
                <motion.span key={index} variants={itemVariants} className="inline-block mr-2">
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          ) : (
            <motion.h1
              key="start-collecting"
              className="text-6xl md:text-7xl lg:text-8xl mb-4 leading-tight font-pacifico" /* Changed font to Pacifico */
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {words2.map((word, index) => (
                <motion.span key={index} variants={itemVariants} className="inline-block mr-2">
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeroSection;
