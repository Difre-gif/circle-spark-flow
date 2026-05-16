import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle, FileText } from 'lucide-react';

interface StepCardProps {
  stepNumber: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  staggerDelay: number;
}

const StepCard: React.FC<StepCardProps> = ({ stepNumber, icon: Icon, iconColor, title, description, staggerDelay }) => {
  return (
    <motion.div
      className="relative bg-card rounded-2xl p-8 text-center shadow-sm border border-gray-100/50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: staggerDelay, duration: 0.5 }}
    >
      <div className="absolute top-4 left-4 text-7xl font-extrabold text-[#0D1B3E] opacity-5 -z-10">
        {stepNumber}
      </div>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${iconColor}`}>
        <Icon size={32} className="text-white" />
      </div>
      <h3 className="text-2xl font-bold text-[#0D1B3E] mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const HowItWorksSection: React.FC = () => {
  const stepsData = [
    {
      stepNumber: '01',
      icon: Smartphone,
      iconColor: 'bg-indigo-600',
      title: 'Tenant pays via MoMo',
      description: 'Your tenant pays rent the way they always have — MTN MoMo USSD. Then they log into BizRent\'s simple tenant portal and submit their MoMo transaction ID and optional screenshot.',
    },
    {
      stepNumber: '02',
      icon: CheckCircle,
      iconColor: 'bg-[#00C853]',
      title: 'You verify in one click',
      description: 'The payment appears in your dashboard\'s pending queue with the full transaction ID visible. You verify it\'s real, then approve or reject in one click. Every action is timestamped and logged.',
    },
    {
      stepNumber: '03',
      icon: FileText,
      iconColor: 'bg-[#FFB300]',
      title: 'Receipt delivered automatically',
      description: 'The moment you approve, BizRent generates a professional PDF receipt and delivers it to your tenant. At month-end, download a full PDF or CSV report for your accountant in one click.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="section-label text-[#0D1B3E] font-semibold uppercase text-sm">How It Works</span>
          <h2 className="text-5xl font-extrabold text-[#0D1B3E] mt-4 leading-tight">
            From MTN MoMo payment to verified receipt<br/>in three steps.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
            No new apps for your tenants. No complex setup for you. Just a clean, reliable system that replaces the chaos.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              stepNumber={step.stepNumber}
              icon={step.icon}
              iconColor={step.iconColor}
              title={step.title}
              description={step.description}
              staggerDelay={0.1 * index}
            />
          ))}
        </div>

        {/* How It Works Visual - Phone Mockups Placeholder */}
        <motion.div
          className="mt-20 flex flex-col lg:flex-row justify-center items-center lg:items-end gap-8 bg-gray-50 p-8 rounded-3xl relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Subtle green particle effects or geometric lines */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <radialGradient id="gradient1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#00C853" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#E0E7EB" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="20" cy="20" r="15" fill="url(#gradient1)" />
              <circle cx="80" cy="80" r="20" fill="url(#gradient1)" />
              <rect x="10" y="60" width="10" height="10" fill="#FFB300" opacity="0.05" />
              <rect x="70" y="10" width="15" height="15" fill="#00C853" opacity="0.08" />
            </svg>
          </div>

          {/* Phone 1: Tenant submit */}
          <div className="relative w-64 h-auto rounded-3xl shadow-xl bg-gray-800 p-1.5 transform rotate-3 z-10">
            <div className="w-full h-full bg-card rounded-2xl p-6 text-left flex flex-col justify-between">
              <div>
                <div className="text-gray-900 font-bold text-lg mb-4">Pay Rent — April 2024</div>
                <p className="text-xs text-gray-500 mb-1">MoMo Transaction ID</p>
                <input type="text" value="TXN-2024-039281" readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-mono text-sm mb-3" />
                <p className="text-xs text-gray-500 mb-1">Unit</p>
                <input type="text" value="Unit 4B — Kimihurura" readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm mb-3" />
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <input type="text" value="RWF 150,000" readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-mono text-sm mb-4" />
              </div>
              <button className="w-full bg-[#00C853] text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-colors">Submit Payment →</button>
            </div>
          </div>

          {/* Phone 2: Landlord verify */}
          <div className="relative w-64 h-auto rounded-3xl shadow-xl bg-gray-800 p-1.5 transform -rotate-3 z-20 mt-8 lg:mt-0">
            <div className="w-full h-full bg-card rounded-2xl p-6 text-left flex flex-col justify-between text-gray-900">
              <div>
                <div className="font-bold text-lg mb-4">Verify Payment — Mutoni C.</div>
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-0.5">MoMo Transaction ID</p>
                  <strong className="font-mono text-sm">TXN-2024-039281</strong>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-0.5">Tenant</p>
                  <strong className="text-sm">Mutoni Claudette · Unit 4B</strong>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-0.5">Amount</p>
                  <strong className="font-mono text-sm">RWF 150,000</strong>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-0.5">Date submitted</p>
                  <strong className="text-sm">April 18, 2025 · 14:32 CAT</strong>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-[#D32F2F] text-white py-3 rounded-md font-semibold hover:bg-red-700 transition-colors">Reject</button>
                <button className="flex-1 bg-[#00C853] text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-colors">Approve</button>
              </div>
            </div>
          </div>

          {/* Phone 3: Tenant receipt */}
          <div className="relative w-64 h-auto rounded-3xl shadow-xl bg-gray-800 p-1.5 transform rotate-3 z-10 mt-16 lg:mt-0">
            <div className="w-full h-full bg-card rounded-2xl p-6 text-left flex flex-col justify-between">
              <div>
                <div className="bg-[#00C853] text-white text-center py-2 rounded-t-xl font-bold text-sm -mx-6 -mt-6 mb-4">Payment Receipt</div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Date</span>
                  <span className="font-bold text-gray-900 text-sm">April 18, 2025</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Tenant</span>
                  <span className="font-bold text-gray-900 text-sm">Mutoni Claudette</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Property</span>
                  <span className="font-bold text-gray-900 text-sm">Kimihurura Heights</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Unit</span>
                  <span className="font-bold text-gray-900 text-sm">4B</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Amount</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">RWF 150,000</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                  <span className="text-gray-600 text-sm">Transaction ID</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">TXN-2024-039281</span>
                </div>
                <p className="text-xs text-gray-500 text-center mb-2">Scan to verify authenticity</p>
                <div className="w-24 h-24 mx-auto bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded-md">QR Code</div>
              </div>
              <button className="w-full bg-[#00C853] text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-colors mt-4">Download PDF</button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
