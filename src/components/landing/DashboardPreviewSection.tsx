import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, TrendingUp, Building2, Users, ArrowRight } from 'lucide-react';

// ─── Dummy Data ───────────────────────────────────────────────────────────────
type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface DemoPayment {
  id: string;
  tenant: string;
  unit: string;
  amount: string;
  txId: string;
  ago: string;
  status: PaymentStatus;
}

const INITIAL_PAYMENTS: DemoPayment[] = [
  { id: '1', tenant: 'Ineza Sandrine', unit: 'Unit A-101', amount: 'RWF 120,000', txId: 'MP26040100001234', ago: '2 min ago', status: 'PENDING' },
  { id: '2', tenant: 'Kagabo Patrick', unit: 'Kiosk 7', amount: 'RWF 95,000', txId: 'MP26040100005678', ago: '8 min ago', status: 'PENDING' },
  { id: '3', tenant: 'Uwimana Christine', unit: 'Unit B-203', amount: 'RWF 200,000', txId: 'MP26040100009012', ago: '22 min ago', status: 'PENDING' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PaymentStatus }) {
  const configs = {
    PENDING: { bg: '#F59E0B', text: '#92400E', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
    APPROVED: { bg: '#10B981', text: '#065F46', icon: <CheckCircle className="h-3 w-3" />, label: 'Approved' },
    REJECTED: { bg: '#DC2626', text: '#991B1B', icon: <XCircle className="h-3 w-3" />, label: 'Rejected' },
  };
  const c = configs[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
      style={{ background: c.bg + '22', color: c.text, border: `1px solid ${c.bg}44` }}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="bg-card rounded-[8px] border border-[#E2E8F0] p-3 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-[6px]" style={{ background: color + '18' }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <span className="text-xs font-medium text-[#64748B]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#0F172A] font-mono leading-none" style={{ fontFamily: 'Inter Mono, monospace' }}>
        {value}
      </p>
      {sub && <p className="text-xs text-[#10B981] font-semibold mt-1">{sub}</p>}
    </div>
  );
}

// ─── Payment Card ────────────────────────────────────────────────────────────
function PaymentCard({
  payment,
  onApprove,
  onReject,
  processing,
}: {
  payment: DemoPayment;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processing: string | null;
}) {
  const isPending = payment.status === 'PENDING';

  return (
    <motion.div
      layout
      key={payment.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-[8px] border border-[#E2E8F0] p-3 shadow-card"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-bold text-[#1E3A8A] leading-none">{payment.tenant}</p>
          <p className="text-xs text-[#64748B] mt-0.5">{payment.unit}</p>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <p className="text-base font-bold font-mono text-[#0F172A] mb-1.5" style={{ fontFamily: 'Inter Mono, monospace' }}>
        {payment.amount}
      </p>

      <div className="flex items-center gap-1.5 bg-[#F8FAFC] rounded-[4px] px-2 py-1 mb-2.5">
        <span className="text-xs text-[#64748B] font-medium">TX:</span>
        <code className="text-xs font-mono text-[#1E3A8A] font-bold">{payment.txId}</code>
      </div>

      <p className="text-xs text-[#94A3B8] mb-2.5">{payment.ago}</p>

      {isPending && (
        <div className="flex gap-1.5">
          <button
            onClick={() => onApprove(payment.id)}
            disabled={processing === payment.id}
            className="flex-1 text-xs font-semibold py-1.5 rounded-[6px] bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white transition-colors disabled:opacity-60 min-h-[32px]"
          >
            {processing === payment.id ? '⟳' : '✓ Approve'}
          </button>
          <button
            onClick={() => onReject(payment.id)}
            disabled={processing === payment.id}
            className="flex-1 text-xs font-semibold py-1.5 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] text-white transition-colors disabled:opacity-60 min-h-[32px]"
          >
            ✕ Reject
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-xs font-semibold px-3 py-2 rounded-[6px] border border-white/10 shadow-lg z-10 whitespace-nowrap"
        >
          ✅ {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Mini Dashboard ───────────────────────────────────────────────────────────
function MiniDashboard() {
  const [payments, setPayments] = useState<DemoPayment[]>(INITIAL_PAYMENTS);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [approvedCount, setApprovedCount] = useState(18);
  const [pendingCount, setPendingCount] = useState(INITIAL_PAYMENTS.length);
  const [collectionRate, setCollectionRate] = useState(74);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleApprove = (id: string) => {
    setProcessing(id);
    setTimeout(() => {
      setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: 'APPROVED' as const } : p));
      setApprovedCount((c) => c + 1);
      setPendingCount((c) => Math.max(0, c - 1));
      setCollectionRate((r) => Math.min(100, r + 3));
      const p = payments.find((p) => p.id === id);
      showToast(`Payment approved. Receipt sent to ${p?.tenant.split(' ')[0]}.`);
      setProcessing(null);
    }, 700);
  };

  const handleReject = (id: string) => {
    setProcessing(id);
    setTimeout(() => {
      setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: 'REJECTED' as const } : p));
      setPendingCount((c) => Math.max(0, c - 1));
      const p = payments.find((p) => p.id === id);
      showToast(`Payment rejected. ${p?.tenant.split(' ')[0]} has been notified.`);
      setProcessing(null);
    }, 700);
  };

  return (
    <div className="relative bg-[#F8FAFC] rounded-[8px] h-full min-h-[520px] flex flex-col overflow-hidden">
      {/* Dashboard header */}
      <div className="bg-[#1E3A8A] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-xs font-bold text-white/80 uppercase tracking-wider">BizRent Dashboard</p>
          <p className="text-xs text-white/50">Kimihurura Properties Ltd.</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
          MC
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Pending alert */}
        {pendingCount > 0 && (
          <motion.div
            layout
            className="flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-[6px] px-3 py-2"
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]" />
            </span>
            <p className="text-xs font-semibold text-[#92400E] flex-1">
              {pendingCount} payment{pendingCount !== 1 ? 's' : ''} waiting for review
            </p>
          </motion.div>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard icon={Building2} label="Properties" value="4" color="#1E3A8A" />
          <MetricCard icon={Users} label="Pending" value={pendingCount} color="#F59E0B" />
          <MetricCard icon={CheckCircle} label="Approved" value={approvedCount} color="#10B981" />
          <MetricCard icon={TrendingUp} label="Collection" value={`${collectionRate}%`} color="#1D4ED8" sub="This month" />
        </div>

        {/* Payments queue */}
        <div>
          <p className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2 px-0.5">
            Pending Review
          </p>
          <div className="space-y-2">
            {payments.filter((p) => p.status !== 'APPROVED' && p.status !== 'REJECTED').map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processing}
              />
            ))}
            {payments.filter((p) => p.status !== 'PENDING').map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processing}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast message={toast} visible={toastVisible} />
    </div>
  );
}

// ─── MacBook Frame ────────────────────────────────────────────────────────────
function MacBookFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full" style={{ maxWidth: '680px' }}>
      {/* Screen */}
      <div
        className="relative rounded-t-[12px] overflow-hidden"
        style={{
          background: '#1A1A1A',
          padding: '12px 12px 0 12px',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Camera notch */}
        <div className="flex justify-center mb-2">
          <div className="w-2 h-2 rounded-full bg-[#333]" />
        </div>
        {/* Screen content */}
        <div className="rounded-t-[4px] overflow-hidden" style={{ aspectRatio: '16/10' }}>
          {children}
        </div>
      </div>
      {/* Base */}
      <div className="relative" style={{ perspective: '1000px' }}>
        <div
          className="w-full h-3 rounded-b-sm"
          style={{
            background: 'linear-gradient(180deg, #2a2a2a 0%, #3a3a3a 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        />
        {/* Foot */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-1 rounded-b-sm"
          style={{ background: '#252525' }}
        />
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function DashboardPreviewSection() {
  const [firstApproved, setFirstApproved] = useState(false);

  return (
    <section id="how-it-works" className="relative bg-[#F8FAFC] py-24 lg:py-32 overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B981] mb-4 block"
          >
            Try it now
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          >
            Use the product before you sign up.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#64748B] max-w-xl mx-auto"
          >
            This is a live, interactive demo. Click Approve on a payment and watch the dashboard update in real time.
          </motion.p>
        </div>

        {/* MacBook + Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <MacBookFrame>
            <MiniDashboard />
          </MacBookFrame>
        </motion.div>

        {/* Post-interaction prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-[#64748B] text-base mb-2">
            That just took 2 seconds.{' '}
            <span className="text-[#0F172A] font-semibold">Imagine doing it for all 22 units.</span>
          </p>
          <a
            href="/register"
            className="group inline-flex items-center gap-2 text-[#1D4ED8] hover:text-[#1E3A8A] font-semibold text-sm transition-colors mt-2"
          >
            Set up your real dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
