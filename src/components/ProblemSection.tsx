import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, AlertTriangle, FileX, Globe } from 'lucide-react';

interface ProblemCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  staggerDelay: number;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ icon: Icon, iconColor, title, description, staggerDelay }) => {
  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: staggerDelay, duration: 0.5 }}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconColor}`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-xl font-bold text-[#0D1B3E] mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const ProblemSection: React.FC = () => {
  const problemCardsData = [
    {
      icon: MessageSquare,
      iconColor: 'bg-[#D32F2F]', // Danger Red
      title: 'WhatsApp screenshot chaos',
      description: '20 tenants. 20 phone numbers. 20 different screenshots of MoMo confirmations — all arriving out of order throughout the month.',
    },
    {
      icon: AlertTriangle,
      iconColor: 'bg-[#D32F2F]', // Danger Red
      title: 'Fake payment fraud',
      description: 'Tenants send edited screenshots claiming they paid. Without a verification system, landlords have been defrauded repeatedly.',
    },
    {
      icon: FileX,
      iconColor: 'bg-[#FFB300]', // Warm Gold
      title: 'No audit trail, no reports',
      description: 'Month-end means manually reconciling Excel sheets, WhatsApp chats, and a phone inbox. It takes days, not minutes.',
    },
    {
      icon: Globe,
      iconColor: 'bg-gray-500', // Gray
      title: 'Every existing tool ignores MoMo',
      description: 'South African, Western, and even Kenyan tools treat MTN MoMo as an afterthought — or don\'t support it at all.',
    },
  ];

  return (
    <section id="problem" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="section-label text-[#0D1B3E] font-semibold uppercase text-sm">The Problem</span>
          <h2 className="text-5xl font-extrabold text-[#0D1B3E] mt-4 leading-tight">
            Rent collection is a monthly<br/>
            administrative <span className="relative inline-block">
              nightmare.
              <motion.span
                className="absolute left-0 bottom-0 h-1 bg-[#D32F2F]"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              />
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
            Landlords in Rwanda and Kenya are savvy businesspeople. The problem is not skill — it's tooling. No platform was ever built for how East Africa actually pays rent.
          </p>
        </motion.div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {problemCardsData.map((card, index) => (
            <ProblemCard
              key={index}
              icon={card.icon}
              iconColor={card.iconColor}
              title={card.title}
              description={card.description}
              staggerDelay={0.1 * index}
            />
          ))}
        </div>

        {/* Testimonial Pull-quote */}
        <motion.div
          className="bg-white border-l-4 border-[#00C853] p-8 text-left max-w-4xl mx-auto shadow-md rounded-lg"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <blockquote className="text-2xl italic text-[#0D1B3E] leading-relaxed mb-6">
            "I spend three days every month chasing payments. I need one place where I can see everything — who paid, who didn't, and the transaction ID to prove it."
          </blockquote>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#00C853] flex items-center justify-center text-white font-bold text-lg mr-4">MC</div>
            <div>
              <p className="font-bold text-[#0D1B3E]">Mutoni Claudette</p>
              <p className="text-gray-600 text-sm">Landlord, Kigali · 26 units, 3 buildings</p>
            </div>
          </div>
        </motion.div>

        {/* Problem Section Image - Placeholder for now */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600">
            [Stylized split illustration of problem vs. solution Placeholder]
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
