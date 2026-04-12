import React, { Suspense, lazy } from 'react';

// ─── Navbar + Hero load immediately (above the fold) ─────────────────────────
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';

// ─── Below-fold sections: lazy loaded so hero renders instantly ───────────────
const ProblemSection = lazy(() => import('@/components/landing/ProblemSection'));
const SolutionSection = lazy(() => import('@/components/landing/SolutionSection'));
const DashboardPreviewSection = lazy(() => import('@/components/landing/DashboardPreviewSection'));
const FeaturesSection = lazy(() => import('@/components/landing/FeaturesSection'));
const SocialProofSection = lazy(() => import('@/components/landing/SocialProofSection'));
const PricingSection = lazy(() => import('@/components/landing/PricingSection'));
const FinalCTASection = lazy(() => import('@/components/landing/FinalCTASection'));
const Footer = lazy(() => import('@/components/landing/Footer'));

// ─── Skeleton placeholder while lazy sections load ───────────────────────────
const SectionSkeleton = () => (
  <div className="py-24 px-6">
    <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
      <div className="h-3 w-24 bg-white/5 rounded" />
      <div className="h-10 w-2/3 bg-white/5 rounded" />
      <div className="h-5 w-1/2 bg-white/5 rounded" />
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="bg-[#0F172A]" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Navbar — always visible, above fold */}
      <Navbar />

      {/* Hero — above fold, critical path */}
      <HeroSection />

      {/* Below fold — lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProblemSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <SolutionSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <DashboardPreviewSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <SocialProofSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <PricingSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FinalCTASection />
      </Suspense>

      <Suspense fallback={<div className="bg-[#0F172A] py-16" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;
