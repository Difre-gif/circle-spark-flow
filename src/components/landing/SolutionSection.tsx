import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Lock } from 'lucide-react';

const PILLARS = [
  {
    icon: LayoutDashboard,
    color: '#1E3A8A',
    title: 'See everything.',
    description: 'One dashboard. Every property. Every tenant. Every payment. Updated the moment a tenant submits — no chasing, no calls.',
  },
  {
    icon: ShieldCheck,
    color: '#10B981',
    title: 'Verify instantly.',
    description: 'Tenants submit their MoMo transaction ID. You approve or reject with one click. Their receipt is generated automatically.',
  },
  {
    icon: Lock,
    color: '#1D4ED8',
    title: 'Know with certainty.',
    description: 'Every action logged. Every receipt archived. Every dispute resolved in seconds, not days. Complete audit trail.',
  },
];

export default function SolutionSection() {
  return (
    <section id="solution" className="relative bg-[#F8FAFC] py-24 lg:py-32 overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B981] mb-4 block"
          >
            The solution
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          >
            From chaos to clarity.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#64748B] max-w-xl mx-auto"
          >
            BizRent replaces the WhatsApp chaos with a professional system built for how landlords in Rwanda actually work.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-[8px] border border-[#E2E8F0] p-8 shadow-card cursor-default"
              style={{ transition: 'box-shadow 0.2s' }}
            >
              <motion.div
                whileHover={{ y: -4, filter: `drop-shadow(0 8px 16px ${pillar.color}44)` }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 rounded-[8px] flex items-center justify-center mb-6"
                style={{ background: pillar.color + '14' }}
              >
                <pillar.icon className="h-6 w-6" style={{ color: pillar.color }} />
              </motion.div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                {pillar.title}
              </h3>
              <p className="text-[#64748B] leading-relaxed text-sm">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
