import React from 'react';
import { motion } from 'framer-motion';

const TickerSection: React.FC = () => {
  const tickerItems = [
    "1,200+ units tracked",
    "RWF 45M+ collected",
    "Zero fraud incidents",
    "3-day reconciliation → 3 seconds",
    "100% MoMo-native",
    "47 active landlords",
    "Kigali · Kampala · Nairobi",
  ];

  // Duplicate items for a seamless loop
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <motion.div
      className="w-full bg-gray-50 py-6 border-y border-gray-100/50 overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <motion.div
          className="flex-shrink-0 text-gray-500 font-medium text-lg mr-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Trusted by landlords managing
        </motion.div>
        <div className="relative flex-1 h-full overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{
              x: ["0%", "-100%"]
            }}
            transition={{
              x: { duration: 30, ease: "linear", repeat: Infinity }
            }}
          >
            {duplicatedItems.map((item, index) => (
              <div key={index} className="flex items-center mx-4">
                <span className="font-mono text-[#0D1B3E] font-bold text-lg leading-none">
                  {item}
                </span>
                {index < duplicatedItems.length - 1 && (
                  <span className="mx-4 text-gray-300">•</span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TickerSection;
