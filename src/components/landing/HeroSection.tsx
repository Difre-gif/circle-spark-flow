import { useEffect, useRef, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import gsap from 'gsap';

// ─── Payment Ticker Data ────────────────────────────────────────────────────
const PAYMENT_FEED = [
  { name: 'Ineza Sandrine', unit: 'Unit A-101', amount: 'RWF 120,000', time: '2s ago', status: 'approved' },
  { name: 'Kagabo Patrick', unit: 'Kiosk 7', amount: 'RWF 95,000', time: '14s ago', status: 'approved' },
  { name: 'Uwimana Christine', unit: 'Unit B-203', amount: 'RWF 200,000', time: 'Pending...', status: 'pending' },
  { name: 'Habimana Jean', unit: 'Unit C-05', amount: 'RWF 150,000', time: '1m ago', status: 'approved' },
  { name: 'Mukamana Rose', unit: 'Unit D-12', amount: 'RWF 180,000', time: '3m ago', status: 'approved' },
  { name: 'Niyonkuru Eric', unit: 'Store 2B', amount: 'RWF 320,000', time: '5m ago', status: 'approved' },
  { name: 'Bizimana Claude', unit: 'Unit F-08', amount: 'RWF 90,000', time: '9m ago', status: 'approved' },
  { name: 'Uwase Aline', unit: 'Unit G-04', amount: 'RWF 130,000', time: '12m ago', status: 'pending' },
];

// ─── Three.js Canvas Component ──────────────────────────────────────────────
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !canvasRef.current) return;

    let THREE: typeof import('three');
    let rafId: number;
    let renderer: import('three').WebGLRenderer;
    let resizeObs: ResizeObserver;

    (async () => {
      THREE = await import('three');
      const el = canvasRef.current!;
      const parent = el.parentElement!;

      // Scene
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0f172a, 10, 40);

      // Camera
      const camera = new THREE.PerspectiveCamera(55, parent.clientWidth / parent.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 10);

      // Renderer
      renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(parent.clientWidth, parent.clientHeight);
      renderer.setClearColor(0x0f172a, 1);

      // ── Building Group ──────────────────────────────────────────────────
      const buildingGroup = new THREE.Group();

      const navyMat = new THREE.MeshPhongMaterial({ color: 0x1e3a8a, shininess: 40, specular: 0x334f9a });
      const darkMat = new THREE.MeshPhongMaterial({ color: 0x0f2463, shininess: 20 });
      const glassMat = new THREE.MeshPhongMaterial({
        color: 0x10b981, transparent: true, opacity: 0.25, shininess: 90, specular: 0x10b981,
      });

      // Main tower body
      const mainGeo = new THREE.BoxGeometry(1.8, 3.6, 1.2);
      const main = new THREE.Mesh(mainGeo, navyMat);
      buildingGroup.add(main);

      // Upper tier
      const upperGeo = new THREE.BoxGeometry(1.1, 1.4, 0.9);
      const upper = new THREE.Mesh(upperGeo, navyMat);
      upper.position.set(0, 2.5, 0);
      buildingGroup.add(upper);

      // Glass façade panels
      const facadeGeo = new THREE.BoxGeometry(1.4, 3.2, 0.05);
      const facade = new THREE.Mesh(facadeGeo, glassMat);
      facade.position.set(0, 0, 0.63);
      buildingGroup.add(facade);

      // Rooftop accent
      const roofGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6);
      const roofMat = new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x065f46, emissiveIntensity: 0.4 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, 3.8, 0);
      buildingGroup.add(roof);

      // Emerald edge highlights
      [mainGeo, upperGeo].forEach((geo) => {
        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });
        const lines = new THREE.LineSegments(edges, lineMat);
        buildingGroup.add(lines.clone());
      });

      // Floating accent cubes
      const accentPositions = [
        [-2.5, 0, -1], [2.8, -0.5, -0.5], [-2, 1.5, 0.5], [3, 1.2, -1], [-1.5, -1.5, 0.8],
      ];
      accentPositions.forEach(([x, y, z]) => {
        const s = 0.15 + Math.random() * 0.25;
        const acGeo = new THREE.BoxGeometry(s, s, s);
        const acMat = new THREE.MeshPhongMaterial({
          color: Math.random() > 0.5 ? 0x10b981 : 0x1d4ed8, transparent: true, opacity: 0.7,
        });
        const ac = new THREE.Mesh(acGeo, acMat);
        ac.position.set(x, y, z);
        ac.rotation.set(Math.random(), Math.random(), Math.random());
        (ac as any)._floatOffset = Math.random() * Math.PI * 2;
        (ac as any)._floatSpeed = 0.4 + Math.random() * 0.4;
        buildingGroup.add(ac);
      });

      buildingGroup.position.set(0, -0.5, 0);
      scene.add(buildingGroup);

      // ── Particle System ─────────────────────────────────────────────────
      const COUNT = 350;
      const positions = new Float32Array(COUNT * 3);
      const speeds = new Float32Array(COUNT);
      const radii = new Float32Array(COUNT);
      const phases = new Float32Array(COUNT);
      const tilts = new Float32Array(COUNT);

      for (let i = 0; i < COUNT; i++) {
        phases[i] = (i / COUNT) * Math.PI * 2;
        radii[i] = 3.5 + Math.random() * 2.5;
        tilts[i] = (Math.random() - 0.5) * 0.6;
        speeds[i] = 0.08 + Math.random() * 0.12;

        positions[i * 3]     = Math.cos(phases[i]) * radii[i];
        positions[i * 3 + 1] = Math.sin(phases[i] * 2) * 0.8 + tilts[i] * radii[i];
        positions[i * 3 + 2] = Math.sin(phases[i]) * radii[i] * 0.6;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Two-color particle system: emerald + white
      const particleMat = new THREE.PointsMaterial({
        color: 0x10b981, size: 0.05, transparent: true, opacity: 0.85, sizeAttenuation: true,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      const whiteMat = new THREE.PointsMaterial({
        color: 0xffffff, size: 0.03, transparent: true, opacity: 0.4, sizeAttenuation: true,
      });
      const whitePositions = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const a = phases[i] + Math.PI;
        whitePositions[i * 3]     = Math.cos(a) * (radii[i] * 0.8);
        whitePositions[i * 3 + 1] = Math.sin(a * 1.5) * 0.5;
        whitePositions[i * 3 + 2] = Math.sin(a) * radii[i] * 0.5;
      }
      const whiteGeo = new THREE.BufferGeometry();
      whiteGeo.setAttribute('position', new THREE.BufferAttribute(whitePositions, 3));
      const whiteParticles = new THREE.Points(whiteGeo, whiteMat);
      scene.add(whiteParticles);

      // ── Lighting ────────────────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0x1e3a8a, 0.8);
      scene.add(ambient);

      const keyLight = new THREE.PointLight(0x10b981, 3, 20);
      keyLight.position.set(5, 5, 5);
      scene.add(keyLight);

      const fillLight = new THREE.PointLight(0x1d4ed8, 2, 15);
      fillLight.position.set(-4, 2, 3);
      scene.add(fillLight);

      const rimLight = new THREE.PointLight(0xf59e0b, 1.2, 12);
      rimLight.position.set(-3, -3, -2);
      scene.add(rimLight);

      // ── Mouse Tracking ──────────────────────────────────────────────────
      let mouseX = 0, mouseY = 0;
      let camTargetX = 0, camTargetY = 0;

      const onMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener('mousemove', onMouse);

      // ── Resize ──────────────────────────────────────────────────────────
      resizeObs = new ResizeObserver(() => {
        const w = parent.clientWidth, h = parent.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      resizeObs.observe(parent);

      // ── Animation Loop ───────────────────────────────────────────────────
      const clock = new THREE.Clock();

      const animate = () => {
        rafId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Camera lerp to mouse
        camTargetX = mouseX * 1.2;
        camTargetY = mouseY * 0.8;
        camera.position.x += (camTargetX - camera.position.x) * 0.04;
        camera.position.y += (camTargetY - camera.position.y) * 0.04;
        camera.lookAt(scene.position);

        // Building breathe
        const breathe = 1 + Math.sin(t * 0.5) * 0.012;
        buildingGroup.scale.setScalar(breathe);
        buildingGroup.rotation.y = Math.sin(t * 0.2) * 0.15;

        // Animate accent cubes
        buildingGroup.children.forEach((child) => {
          if ((child as any)._floatOffset !== undefined) {
            child.position.y += Math.sin(t * (child as any)._floatSpeed + (child as any)._floatOffset) * 0.003;
            child.rotation.x += 0.004;
            child.rotation.z += 0.003;
          }
        });

        // Orbit particles
        const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
        const wPosAttr = whiteParticles.geometry.getAttribute('position') as THREE.BufferAttribute;

        for (let i = 0; i < COUNT; i++) {
          const speed = speeds[i];
          const phase = phases[i] + t * speed;
          const r = radii[i];
          const burst = 0.5 + 0.5 * Math.sin(phase * 3); // speed variation: burst rhythm

          posAttr.setXYZ(
            i,
            Math.cos(phase) * r * (1 + burst * 0.05),
            Math.sin(phase * 2) * 0.8 + tilts[i] * r,
            Math.sin(phase) * r * 0.6
          );

          const wa = phase + Math.PI;
          wPosAttr.setXYZ(
            i,
            Math.cos(wa) * (r * 0.8),
            Math.sin(wa * 1.5) * 0.5,
            Math.sin(wa) * r * 0.5
          );
        }

        posAttr.needsUpdate = true;
        wPosAttr.needsUpdate = true;

        // Key light orbit
        keyLight.position.x = Math.sin(t * 0.3) * 6;
        keyLight.position.z = Math.cos(t * 0.3) * 6;

        renderer.render(scene, camera);
      };

      animate();
      window.removeEventListener('mousemove', onMouse);
      window.addEventListener('mousemove', onMouse);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('mousemove', onMouse);
        resizeObs?.disconnect();
        renderer.dispose();
      };
    })();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}

// ─── Payment Ticker ──────────────────────────────────────────────────────────
function PaymentTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % PAYMENT_FEED.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const showing = [
    PAYMENT_FEED[index % PAYMENT_FEED.length],
    PAYMENT_FEED[(index + 1) % PAYMENT_FEED.length],
    PAYMENT_FEED[(index + 2) % PAYMENT_FEED.length],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.8, duration: 0.6 }}
      className="absolute bottom-16 right-6 lg:right-12 w-72 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(15,23,42,0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
        </span>
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Live payments</span>
      </div>
      <div className="py-1 overflow-hidden" style={{ height: '114px' }}>
        <AnimatePresence mode="popLayout">
          {showing.map((p, i) => (
            <motion.div
              key={`${index}-${i}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 px-4 py-2"
            >
              <span className="text-base leading-none flex-shrink-0">
                {p.status === 'approved' ? '✅' : '⏳'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                <p className="text-xs text-white/40">{p.unit}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-mono font-bold text-[#10B981]">{p.amount}</p>
                <p className="text-xs text-white/30">{p.time}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Scroll Indicator ────────────────────────────────────────────────────────
function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fn = () => { if (window.scrollY > 100) setVisible(false); };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 3.2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
    >
      <span className="text-xs text-white/30 uppercase tracking-widest font-medium">Scroll</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        className="w-px h-8 bg-gradient-to-b from-[#10B981] to-transparent"
      />
    </motion.div>
  );
}

// ─── Main Hero ───────────────────────────────────────────────────────────────
export default function HeroSection() {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLHeadingElement>(null);
  const line2Ref = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    if (prefersReduced) {
      // Instantly show everything
      [badgeRef, line1Ref, line2Ref, subRef, ctaRef, socialRef].forEach((r) => {
        if (r.current) r.current.style.opacity = '1';
      });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Badge
    tl.fromTo(badgeRef.current,
      { x: -24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6 }
    );

    // Line 1: "Stop chasing." word by word
    const words1 = line1Ref.current?.querySelectorAll('[data-word]') ?? [];
    tl.fromTo(Array.from(words1),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.09 },
      0.3
    );

    // Line 2: "Start collecting." — slides up + color
    const words2 = line2Ref.current?.querySelectorAll('[data-word]') ?? [];
    tl.fromTo(Array.from(words2),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.09 },
      0.85
    );

    // Subheadline
    tl.fromTo(subRef.current,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      1.45
    );

    // CTA cluster
    tl.fromTo(ctaRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      2.0
    );

    // Social proof
    tl.fromTo(socialRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      2.4
    );

    return () => { tl.kill(); };
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#0F172A]">
      {/* Static gradient fallback — shows instantly while Three.js loads */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(30,58,138,0.5) 0%, rgba(16,185,129,0.12) 40%, rgba(15,23,42,0) 70%), #0F172A',
        }}
      />

      {/* Three.js canvas — lazy mounted */}
      <Suspense fallback={null}>
        <HeroCanvas />
      </Suspense>

      {/* Content overlay */}
      <div
        ref={textContainerRef}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-32 lg:pb-40"
      >
        <div className="max-w-3xl">
          {/* Regional launch badge */}
          <div ref={badgeRef} className="mb-8" style={{ opacity: 0 }}>
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#1E3A8A] bg-[#F8FAFC] border border-[#E2E8F0]"
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            >
              <span>🇷🇼 🇰🇪</span>
              <span>Now live in Rwanda and Kenya</span>
            </span>
          </div>

          {/* H1 Line 1 */}
          <h1
            ref={line1Ref}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight text-white mb-0"
            style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 700 }}
          >
            {'Stop chasing.'.split(' ').map((word, i) => (
              <span key={i} data-word className="inline-block mr-[0.22em]" style={{ opacity: 0 }}>
                {word}
              </span>
            ))}
          </h1>

          {/* H1 Line 2 */}
          <h1
            ref={line2Ref}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight text-[#10B981] mb-6"
            style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 700 }}
          >
            {'Start collecting.'.split(' ').map((word, i) => (
              <span key={i} data-word className="inline-block mr-[0.22em]" style={{ opacity: 0 }}>
                {word}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p
            ref={subRef}
            className="text-lg lg:text-xl text-white/60 leading-relaxed max-w-xl mb-10"
            style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 400, opacity: 0 }}
          >
            BizRent gives landlords in Rwanda and Kenya a single dashboard to verify MoMo
            payments, track every property, and know — with certainty — who has paid
            and who has not.
          </p>

          {/* CTA cluster */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mb-10" style={{ opacity: 0 }}>
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[8px] bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-semibold text-base px-7 py-4 transition-colors duration-200"
              style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 600, minHeight: '52px' }}
            >
              {/* Shimmer sweep on hover */}
              <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
              Start free — 30 days, no card needed
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/25 text-white/80 hover:text-white hover:bg-white/8 font-semibold text-base px-7 py-4 transition-all duration-200"
              style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 600, minHeight: '52px' }}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See how it works
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Social proof strip */}
          <div
            ref={socialRef}
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
            style={{ opacity: 0 }}
          >
            {[
              'Trusted by landlords in Kigali and Nairobi',
              'RWF 2.5B+ tracked',
              'Zero missed payments',
            ].map((text, i) => (
              <span key={i} className="flex items-center gap-1.5 text-sm text-white/40">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-[#10B981] opacity-60" />}
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Payment ticker — lower right */}
      <PaymentTicker />

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}
