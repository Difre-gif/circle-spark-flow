import { motion } from 'framer-motion';
import { ListChecks, ShieldAlert, MapPin, FileText, BarChart3, ScrollText } from 'lucide-react';

const FEATURES = [
  {
    icon: ListChecks,
    color: '#1E3A8A',
    title: 'Pending Payments Queue',
    description: 'Every payment proof in one place. Approve or reject with one click. Your tenant gets their receipt automatically — no manual work.',
    visual: <PendingQueueVisual />,
  },
  {
    icon: ShieldAlert,
    color: '#DC2626',
    title: 'Fraud Prevention',
    description: 'See the transaction ID before you approve. MoMo IDs are verifiable. Screenshots are not enough — BizRent records both.',
    visual: <FraudVisual />,
  },
  {
    icon: MapPin,
    color: '#10B981',
    title: 'Multi-Property Dashboard',
    description: 'All your buildings. All your units. One login. Whether you manage 3 properties or 30, everything is visible from one place.',
    visual: <MapVisual />,
  },
  {
    icon: FileText,
    color: '#065F46',
    title: 'Automated PDF Receipts',
    description: 'Every approved payment generates a branded PDF receipt automatically. Legal proof of payment your tenant can download any time.',
    visual: <ReceiptVisual />,
  },
  {
    icon: BarChart3,
    color: '#1D4ED8',
    title: 'Reports in One Click',
    description: 'End of month used to mean three days with Excel. Now it means one click. Your accountant gets exactly what they need.',
    visual: <ReportVisual />,
  },
  {
    icon: ScrollText,
    color: '#0F172A',
    title: 'Full Audit Trail',
    description: 'Every action. Every actor. Every timestamp. If a dispute ever happens, you have the evidence. Immutable.',
    visual: <AuditVisual />,
  },
];

function PendingQueueVisual() {
  return (
    <div className="space-y-2 p-4 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0]">
      {[
        { name: 'Ineza Sandrine', amount: 'RWF 120,000', status: 'PENDING' },
        { name: 'Kagabo Patrick', amount: 'RWF 95,000', status: 'APPROVED' },
      ].map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 + 0.2 }}
          className="flex items-center justify-between bg-white rounded-[6px] border border-[#E2E8F0] px-3 py-2"
        >
          <div>
            <p className="text-xs font-semibold text-[#1E3A8A]">{p.name}</p>
            <p className="text-xs font-mono text-[#0F172A]">{p.amount}</p>
          </div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: p.status === 'PENDING' ? '#F59E0B22' : '#10B98122',
              color: p.status === 'PENDING' ? '#92400E' : '#065F46',
            }}
          >
            {p.status === 'PENDING' ? 'Pending' : '✓ Approved'}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function FraudVisual() {
  return (
    <div className="flex gap-3 p-4 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0]">
      <div className="flex-1 relative bg-white rounded-[6px] border-2 border-[#DC2626] p-3 flex items-center justify-center" style={{ minHeight: '80px' }}>
        <div className="blur-sm text-xs text-center text-[#94A3B8]">📷<br/>blurry.jpg</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">❌</span>
        </div>
      </div>
      <div className="flex-1 relative bg-white rounded-[6px] border-2 border-[#10B981] p-3">
        <div className="text-xs font-mono text-[#1E3A8A] font-bold">MP26040100001234</div>
        <div className="text-xs text-[#64748B] mt-1">Verified ✓</div>
        <div className="mt-2 text-xs font-bold text-[#10B981]">RWF 120,000</div>
      </div>
    </div>
  );
}

function MapVisual() {
  const pins = [
    { top: '35%', left: '30%', name: 'Kimihurura', color: '#1E3A8A' },
    { top: '65%', left: '45%', name: 'Nyamirambo', color: '#10B981' },
    { top: '25%', left: '65%', name: 'Remera', color: '#1D4ED8' },
  ];
  return (
    <div className="relative bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] p-4" style={{ minHeight: '100px' }}>
      <div className="absolute inset-4 rounded-[4px] overflow-hidden opacity-20"
        style={{ background: 'repeating-linear-gradient(45deg, #1E3A8A, #1E3A8A 1px, transparent 1px, transparent 12px)' }}
      />
      {pins.map((pin, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.8 }}
          className="absolute flex flex-col items-center"
          style={{ top: pin.top, left: pin.left }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center" style={{ background: pin.color }}>
            <span className="text-[5px] text-white font-bold">●</span>
          </div>
          <span className="text-xs font-semibold mt-0.5 whitespace-nowrap text-[#0F172A]" style={{ fontSize: '9px' }}>{pin.name}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ReceiptVisual() {
  return (
    <motion.div
      initial={{ rotateY: 45, opacity: 0.5 }}
      whileInView={{ rotateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-[6px] border border-[#E2E8F0] p-4 shadow-elevated"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-bold text-[#1E3A8A]">BizRent Receipt</p>
          <p className="text-xs font-mono text-[#94A3B8]">BR-2026-000001</p>
        </div>
        <span className="text-xs font-bold bg-[#10B981] text-white px-2 py-0.5 rounded-full">APPROVED</span>
      </div>
      <div className="space-y-1 text-xs border-t border-[#E2E8F0] pt-2">
        <div className="flex justify-between"><span className="text-[#64748B]">Tenant</span><span className="font-semibold text-[#0F172A]">Ineza Sandrine</span></div>
        <div className="flex justify-between"><span className="text-[#64748B]">Amount</span><span className="font-mono font-bold text-[#1E3A8A]">RWF 120,000</span></div>
        <div className="flex justify-between"><span className="text-[#64748B]">Period</span><span className="font-semibold text-[#0F172A]">April 2026</span></div>
      </div>
    </motion.div>
  );
}

function ReportVisual() {
  const bars = [45, 72, 55, 89, 63, 91];
  return (
    <div className="bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] p-4">
      <div className="flex items-end gap-2 h-16">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 rounded-t-[3px]"
            style={{ background: i === bars.length - 1 ? '#10B981' : '#1E3A8A', opacity: 0.7 + i * 0.05 }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between">
        <span className="text-xs text-[#94A3B8]">Nov</span>
        <span className="text-xs font-bold text-[#10B981]">Apr ↑ 91%</span>
      </div>
    </div>
  );
}

function AuditVisual() {
  const events = [
    { icon: '📤', action: 'PAYMENT_SUBMITTED', actor: 'Ineza S.', time: '09:12' },
    { icon: '✅', action: 'PAYMENT_APPROVED', actor: 'Mutoni C.', time: '09:14' },
    { icon: '📄', action: 'RECEIPT_DOWNLOADED', actor: 'Ineza S.', time: '09:15' },
  ];
  return (
    <div className="space-y-1.5 p-3 bg-[#0F172A] rounded-[8px]">
      {events.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12 + 0.2 }}
          className="flex items-center gap-2 text-xs"
        >
          <span>{e.icon}</span>
          <code className="text-[#10B981] font-mono text-xs">{e.action}</code>
          <span className="text-white/30 flex-1 text-right">{e.actor} · {e.time}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative bg-[#0F172A] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B981] mb-4 block"
          >
            Built for Rwanda and Kenya
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          >
            Every feature has a purpose.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/50 max-w-xl mx-auto"
          >
            No bloat. No complexity. Just the exact tools landlords in Kigali and Nairobi need, done right.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#1E293B] rounded-[8px] border border-white/8 p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-[6px] flex items-center justify-center flex-shrink-0"
                  style={{ background: feature.color + '20' }}
                >
                  <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                  {feature.title}
                </h3>
              </div>

              {feature.visual}

              <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
