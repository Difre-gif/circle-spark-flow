
import React from 'react';
import NavigationBar from '../components/NavigationBar';
import HeroSection from '../components/HeroSection';
import HeroContentSection from '../components/HeroContentSection';
import { ParticleHeroBackground } from '../components/ui/particle-hero';
import TickerSection from '../components/TickerSection';
import { AnimatedShaderBackground } from '../components/ui/animated-shader-background';
import ProblemSection from '../components/ProblemSection';
import { VectorFieldBackground } from '../components/ui/vector-field';
import HowItWorksSection from '../components/HowItWorksSection';
import FeaturesSection from '../components/FeaturesSection';
import ComparisonTableSection from '../components/ComparisonTableSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { WovenLightHeroBackground } from '../components/ui/woven-light-hero';
import PricingSection from '../components/PricingSection';
import FinalCtaSection from '../components/FinalCtaSection';
import FooterSection from '../components/FooterSection';

const LandingPage: React.FC = () => {
  return (
      <>
        <NavigationBar />
        <div className="landing-page">
      <HeroSection />
      <ParticleHeroBackground>
      <HeroContentSection />
</ParticleHeroBackground>
      <AnimatedShaderBackground>
      <TickerSection />
</AnimatedShaderBackground>
      <VectorFieldBackground preset="small">
      <ProblemSection />
</VectorFieldBackground>
      <HowItWorksSection />
      <VectorFieldBackground preset="small">
      <FeaturesSection />
</VectorFieldBackground>
      <ComparisonTableSection />
      <WovenLightHeroBackground>
      <TestimonialsSection />
</WovenLightHeroBackground>
      <PricingSection />
      <ParticleHeroBackground>
      <FinalCtaSection />
</ParticleHeroBackground>
      <FooterSection />
    </div>
      </>
  );
};

export default LandingPage;
