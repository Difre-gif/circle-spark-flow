import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, FileText, Users, BarChart3, Bell } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  hasCoreBadge?: boolean;
  staggerDelay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, iconColor, title, description, hasCoreBadge, staggerDelay }) => {
  return (
    <motion.div
      className="bg-white border border-gray-100/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: staggerDelay, duration: 0.5 }}
    >
      {hasCoreBadge && (
        <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-[#00C853] px-3 py-1 text-xs font-semibold text-white">
          Core
        </span>
      )}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconColor}`}>
        <Icon size={28} className="text-white" />
      </div>
      <h3 className="text-xl font-bold text-[#0D1B3E] mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const featuresData = [
    {
      icon: LayoutDashboard,
      iconColor: 'bg-green-500',
      title: 'Live payment dashboard',
      description: 'Tenants submit their MoMo transaction ID, and BizRent instantly verifies it with MTN, eliminating fake screenshots and fraud.',
    },
    {
      icon: ShieldCheck,
      iconColor: 'bg-red-500',
      title: 'MoMo fraud prevention',
      description: 'Tenants send edited screenshots claiming they paid. Without a verification system, landlords have been defrauded repeatedly.',
      hasCoreBadge: true,
    },
    {
      icon: FileText,
      iconColor: 'bg-yellow-500',
      title: 'Automatic PDF receipts',
      description: 'Month-end means manually reconciling Excel sheets, WhatsApp chats, and a phone inbox. It takes days, not minutes.',
      hasCoreBadge: true,
    },
    {
      icon: Users,
      iconColor: 'bg-blue-500',
      title: 'Multi-property & role management',
      description: 'South African, Western, and even Kenyan tools treat MTN MoMo as an afterthought — or don\'t support it at all.',
    },
    {
      icon: BarChart3,
      iconColor: 'bg-purple-500',
      title: 'One-click financial reports',
      description: 'South African, Western, and even Kenyan tools treat MTN MoMo as an afterthought — or don\'t support it at all.',
    },
    {
      icon: Bell,
      iconColor: 'bg-teal-500',
      title: 'Automated SMS & WhatsApp alerts',
      description: 'South African, Western, and even Kenyan tools treat MTN MoMo as an afterthought — or don\'t support it at all.',
    },
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="section-label text-[#0D1B3E] font-semibold uppercase text-sm">Features</span>
          <h2 className="text-5xl font-extrabold text-[#0D1B3E] mt-4 leading-tight">
            Everything landlords in Rwanda and Kenya<br/>actually need.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
            Built from scratch for the East African market — not ported<br/>from South Africa or Silicon Valley and adapted as an afterthought.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              iconColor={feature.iconColor}
              title={feature.title}
              description={feature.description}
              hasCoreBadge={feature.hasCoreBadge}
              staggerDelay={0.1 * index}
            />
          ))}
        </div>

        {/* Feature Section Dashboard Visual - Placeholder for now */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="w-full h-[500px] bg-gray-200 rounded-xl shadow-xl flex items-center justify-center text-gray-600">
            [Widescreen dashboard screenshot mockup Placeholder]
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
