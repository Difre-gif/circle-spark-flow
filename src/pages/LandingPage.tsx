import React, { Suspense, lazy } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';

const ProblemSection = lazy(() => import('@/components/landing/ProblemSection'));
const SolutionSection = lazy(() => import('@/components/landing/SolutionSection'));
const DashboardPreviewSection = lazy(() => import('@/components/landing/DashboardPreviewSection'));
const FeaturesSection = lazy(() => import('@/components/landing/FeaturesSection'));
const SocialProofSection = lazy(() => import('@/components/landing/SocialProofSection'));
const PricingSection = lazy(() => import('@/components/landing/PricingSection'));
const FinalCTASection = lazy(() => import('@/components/landing/FinalCTASection'));
const Footer = lazy(() => import('@/components/landing/Footer'));

const SectionSkeleton = () => (
  <div className="px-6 py-24">
    <div className="mx-auto max-w-4xl animate-pulse space-y-4">
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="h-10 w-2/3 rounded bg-slate-200" />
      <div className="h-5 w-1/2 rounded bg-slate-200" />
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-950" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <Navbar />
      <HeroSection />

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

      <Suspense fallback={<div className="bg-[#08111F] py-16" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;
