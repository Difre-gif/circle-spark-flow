import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import gsap from 'gsap';

// ─── Canvas gradient mesh background ─────────────────────────────────────────
function GradientMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Color blobs
    const blobs = [
      { x: width * 0.3, y: height * 0.4, r: width * 0.4, vx: 0.3, vy: 0.2, color: '#1D4ED8' },
      { x: width * 0.7, y: height * 0.6, r: width * 0.35, vx: -0.2, vy: 0.3, color: '#065F46' },
      { x: width * 0.5, y: height * 0.2, r: width * 0.3, vx: 0.15, vy: -0.25, color: '#1E3A8A' },
    ];

    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x < -blob.r || blob.x > width + blob.r) blob.vx *= -1;
        if (blob.y < -blob.r || blob.y > height + blob.r) blob.vy *= -1;

        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
        grad.addColorStop(0, blob.color + 'aa');
        grad.addColorStop(1, blob.color + '00');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'block' }} />;
}

// ─── The magnificent CTA button ───────────────────────────────────────────────
function CTAButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = '/register';
    }, 500);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={loading}
      className="relative overflow-hidden rounded-[12px] px-10 py-5 font-bold text-lg text-white shadow-2xl cursor-pointer border-0 outline-none"
      style={{
        background: 'linear-gradient(135deg, #1D4ED8, #10B981, #1D4ED8)',
        backgroundSize: '200% 100%',
        animation: 'shimmerGradient 3s ease infinite',
        minHeight: '64px',
        minWidth: '320px',
        fontFamily: 'Inter, Arial, sans-serif',
        fontWeight: 700,
        fontSize: '18px',
      }}
    >
      {/* Radial glow on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 rounded-[12px]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.3) 0%, transparent 70%)' }}
      />

      <span className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          'Start collecting — it\'s free for 30 days'
        )}
      </span>
    </motion.button>
  );
}

export default function FinalCTASection() {
  return (
    <>
      <style>{`
        @keyframes shimmerGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1E3A8A]">
        {/* Canvas gradient mesh */}
        <GradientMesh />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#1E3A8A]/40" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B981] mb-6 block"
          >
            Join 200+ Kigali landlords
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]"
            style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 700 }}
          >
            Your properties are waiting for a system that works.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 mb-12 max-w-xl mx-auto leading-relaxed"
          >
            50+ Kigali landlords already know who has paid and who has not. In real time. Every day.
          </motion.p>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <CTAButton />

            {/* Guarantees */}
            <div className="flex flex-wrap justify-center gap-6">
              {[
                'No card required',
                'No commitment',
                'Setup in 5 minutes',
              ].map((text, i) => (
                <span key={i} className="flex items-center gap-2 text-sm text-white/60 font-medium">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  {text}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Social momentum */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-xs text-white/25 font-medium"
          >
            14 landlords signed up this week.
          </motion.p>
        </div>
      </section>
    </>
  );
}
