import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MESSAGES = [
  { sender: 'tenant', name: 'Ineza S.', time: '09:12', text: 'I paid! MP26040100001234', type: 'text' },
  { sender: 'tenant', name: 'Kagabo P.', time: '09:18', text: '📷 Screenshot', type: 'image', blurry: true },
  { sender: 'tenant', name: 'Uwimana C.', time: '09:31', text: 'nimeshalipa wiki iliyopita', type: 'text' },
  { sender: 'tenant', name: 'Habimana J.', time: '09:47', text: 'sorry I\'ll pay tomorrow boss', type: 'text' },
  { sender: 'tenant', name: 'Mutoni A.', time: '10:02', text: '📷 Payment proof', type: 'image', blurry: false },
  { sender: 'tenant', name: 'Nkusi B.', time: '10:15', text: 'boss I sent RWF 80k not 120k, ok?', type: 'text' },
  { sender: 'landlord', name: 'You', time: '10:22', text: 'Who paid? Who didn\'t? I can\'t tell anymore 😫', type: 'text' },
];

const STATS = [
  { value: '3', unit: 'days', label: 'A Kigali landlord spends every month chasing rent' },
  { value: '43', unit: '%', label: 'Of disputes caused by unverifiable screenshots' },
  { value: '0', unit: '', label: 'Official receipts most tenants have ever received' },
];

function WhatsAppBubble({ msg, visible }: { msg: typeof MESSAGES[0]; visible: boolean }) {
  const isLandlord = msg.sender === 'landlord';

  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-end gap-2 ${isLandlord ? 'justify-end' : 'justify-start'} mb-2`}
    >
      {!isLandlord && (
        <div className="w-7 h-7 rounded-full bg-[#1E3A8A]/30 border border-white/10 flex items-center justify-center text-xs font-bold text-white/60 flex-shrink-0 mb-1">
          {msg.name.charAt(0)}
        </div>
      )}
      <div className={`max-w-[75%] ${isLandlord ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isLandlord && (
          <span className="text-xs text-white/40 mb-0.5 ml-1 font-medium">{msg.name}</span>
        )}
        <div
          className={`px-3 py-2 rounded-xl text-sm leading-snug ${
            isLandlord
              ? 'bg-[#1E3A8A] text-white rounded-br-sm'
              : 'bg-[#1F2D3D] text-white/90 rounded-bl-sm border border-white/8'
          }`}
        >
          {msg.type === 'image' ? (
            <div
              className={`w-36 h-20 rounded-lg flex items-center justify-center ${msg.blurry ? 'blur-sm' : ''}`}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="text-2xl">📷</span>
            </div>
          ) : (
            <span>{msg.text}</span>
          )}
        </div>
        <span className="text-xs text-white/25 mt-0.5 mx-1">{msg.time}</span>
      </div>
    </motion.div>
  );
}

function StatCounter({ value, unit, label, delay }: { value: string; unit: string; label: string; delay: number }) {
  const numRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        const target = parseInt(value) || 0;
        if (target > 0 && numRef.current) {
          gsap.fromTo(
            numRef.current,
            { textContent: '0' },
            {
              textContent: target,
              duration: 2,
              delay: delay * 0.4,
              ease: 'power2.out',
              snap: { textContent: 1 },
              onUpdate() { if (numRef.current) numRef.current.textContent = String(Math.round(parseFloat(numRef.current.textContent || '0'))); },
            }
          );
        }
      }
    }, { threshold: 0.5 });

    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [started]);

  const isZero = value === '0';

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: delay * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center"
    >
      <div className="flex items-end gap-1 mb-2">
        <span
          ref={numRef}
          className={`text-6xl lg:text-7xl font-bold font-mono leading-none ${isZero ? 'text-[#DC2626]' : 'text-white'}`}
          style={{ fontFamily: 'Inter Mono, Courier New, monospace' }}
        >
          {value}
        </span>
        {unit && (
          <span className={`text-3xl font-bold pb-1 ${isZero ? 'text-[#DC2626]' : 'text-[#10B981]'}`}>
            {unit}
          </span>
        )}
      </div>
      <p className="text-sm text-white/50 max-w-[180px] leading-snug">{label}</p>
      {isZero && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.8, duration: 0.4 }}
          className="mt-2 text-xs font-bold text-[#DC2626] bg-[#DC2626]/10 px-3 py-1 rounded-full uppercase tracking-wide"
        >
          Zero. None. Never.
        </motion.span>
      )}
    </motion.div>
  );
}

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setVisibleMessages(MESSAGES.length);
      return;
    }

    // Scroll-driven message reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%',
        end: 'center center',
        scrub: false,
        onEnter: () => {
          // Stagger messages in
          MESSAGES.forEach((_, i) => {
            setTimeout(() => setVisibleMessages(i + 1), i * 600);
          });
          // After all messages, explode
          setTimeout(() => setExploded(true), MESSAGES.length * 600 + 800);
        },
        once: true,
      },
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === sectionRef.current) st.kill();
      });
    };
  }, []);

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0F172A] py-24 lg:py-32"
    >
      {/* Background subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(30,58,138,1) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,138,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B981] mb-4 block">
            The problem
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
            This is not a technology problem.
          </h2>
          <h2 className="text-4xl lg:text-5xl font-bold text-white/40" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
            This is a tooling problem.
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* WhatsApp simulation */}
          <div>
            <p className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
              Your rent collection — right now
            </p>

            {/* WhatsApp chrome */}
            <div
              className="rounded-[16px] overflow-hidden"
              style={{
                background: 'rgba(30,41,59,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* WhatsApp header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#1E293B]/80">
                <div className="w-9 h-9 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center text-sm">
                  🏠
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Rent Collection - April</p>
                  <p className="text-xs text-white/40">{MESSAGES.length} members</p>
                </div>
                <div className="ml-auto text-xl">📱</div>
              </div>

              {/* Messages */}
              <div className="p-4 min-h-[360px] max-h-[360px] overflow-y-auto flex flex-col justify-end">
                <AnimatePresence>
                  {!exploded ? (
                    MESSAGES.slice(0, visibleMessages).map((msg, i) => (
                      <WhatsAppBubble key={i} msg={msg} visible={i < visibleMessages} />
                    ))
                  ) : (
                    <motion.div
                      key="exploded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-48 gap-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="w-16 h-16 rounded-full bg-[#DC2626]/20 border border-[#DC2626]/30 flex items-center justify-center"
                      >
                        <span className="text-3xl">😫</span>
                      </motion.div>
                      <p className="text-sm text-white/50 text-center max-w-xs">
                        23 screenshots. 6 unverified claims. 4 hours lost.<br />
                        <span className="text-white/30">Every. Single. Month.</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Stats + headline */}
          <div className="flex flex-col justify-center gap-10">
            <div className="grid grid-cols-3 gap-6">
              {STATS.map((stat, i) => (
                <StatCounter key={i} {...stat} delay={i} />
              ))}
            </div>

            <div className="pt-6 border-t border-white/8">
              <p className="text-base text-white/50 leading-relaxed mb-6">
                Most landlords in Kigali manage rent the same way they did in 2005 — on the phone, on WhatsApp, on faith. BizRent ends that.
              </p>
              <a
                href="#solution"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#solution')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-[#10B981] hover:text-[#10B981]/80 font-semibold text-sm transition-colors"
              >
                See the solution
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
