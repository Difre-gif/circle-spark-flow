import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 200, suffix: '+', label: 'Landlords', sub: 'Active in Rwanda and Kenya' },
  { value: 2.5, suffix: 'B+', label: 'RWF Tracked', sub: 'This year' },
  { value: 99.9, suffix: '%', label: 'Uptime', sub: 'Last 12 months' },
  { value: 2, suffix: 's', label: 'Approval time', sub: 'Average' },
];

const TESTIMONIALS = [
  {
    initials: 'MC',
    name: 'Mutoni Claudette',
    role: 'Landlord · Kimihurura, Kigali',
    color: '#1E3A8A',
    quote: 'I spent three days every month chasing payments. Now I open BizRent on the 1st and approve everything in 20 minutes. I haven\'t called a tenant about payment in two months.',
  },
  {
    initials: 'JH',
    name: 'Jean-Pierre Habimana',
    role: 'Property Manager · Nairobi',
    color: '#10B981',
    quote: 'My clients used to call me every third of the month asking how much was collected. Now I send them the BizRent report link. They see it themselves. I look professional.',
  },
  {
    initials: 'IS',
    name: 'Ineza Sandrine',
    role: 'Tenant · Nyamirambo, Kigali',
    color: '#1D4ED8',
    quote: 'I finally have receipts for my rent. I\'ve been renting for four years with nothing to show for it. Now I download my receipt the same day I pay.',
  },
];

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started && ref.current) {
        setStarted(true);
        const isDecimal = value % 1 !== 0;
        gsap.fromTo(
          ref.current,
          { textContent: '0' },
          {
            textContent: value,
            duration: 2.2,
            ease: 'power2.out',
            snap: { textContent: isDecimal ? 0.1 : 1 },
            onUpdate() {
              if (ref.current) {
                const v = parseFloat(ref.current.textContent || '0');
                ref.current.textContent = isDecimal ? v.toFixed(1) : String(Math.round(v));
              }
            },
          }
        );
      }
    }, { threshold: 0.5 });

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

export default function SocialProofSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="relative bg-[#F8FAFC] py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24 pb-24 border-b border-[#E2E8F0]">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div
                className="text-5xl lg:text-6xl font-bold font-mono leading-none text-[#1E3A8A] mb-2"
                style={{ fontFamily: 'Inter Mono, Courier New, monospace' }}
              >
                <CountUp value={stat.value} suffix={stat.suffix} />
                <span className="text-[#10B981]">{stat.suffix}</span>
              </div>
              <p className="text-sm font-bold text-[#0F172A]">{stat.label}</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B981] mb-4 block"
            >
              Real landlords. Real results.
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-6"
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            >
              The landlords ahead of you are already here.
            </motion.h2>

            {/* Testimonial dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeTestimonial ? '24px' : '6px',
                    background: i === activeTestimonial ? '#1E3A8A' : '#CBD5E1',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative min-h-[280px]">
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((t, i) =>
                i === activeTestimonial ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 bg-white rounded-[8px] border border-[#E2E8F0] p-8 shadow-elevated flex flex-col justify-between"
                  >
                    {/* Quote mark */}
                    <div
                      className="text-6xl leading-none mb-4 font-bold"
                      style={{ color: t.color + '20', fontFamily: 'Georgia, serif' }}
                    >
                      "
                    </div>

                    <p className="text-[#0F172A] text-base lg:text-lg leading-relaxed font-medium flex-1">
                      "{t.quote}"
                    </p>

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-[#E2E8F0]">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: t.color }}
                      >
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">{t.name}</p>
                        <p className="text-xs text-[#64748B]">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
