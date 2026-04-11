
import React from 'react';
import NavigationBar from '../components/NavigationBar';
import { BrowserRouter as Router } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import TickerSection from '../components/TickerSection';
import ProblemSection from '../components/ProblemSection';
import HowItWorksSection from '../components/HowItWorksSection';
import FeaturesSection from '../components/FeaturesSection';
import ComparisonTableSection from '../components/ComparisonTableSection';
import TestimonialsSection from '../components/TestimonialsSection';
import PricingSection from '../components/PricingSection';
import FinalCtaSection from '../components/FinalCtaSection';
import FooterSection from '../components/FooterSection';

const LandingPage: React.FC = () => {
  return (
    <Router>
      <NavigationBar />
      <div className="landing-page">
      <HeroSection />
      <TickerSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ComparisonTableSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCtaSection />
      <FooterSection />
    </div>
    </Router>
  );
};

export default LandingPage;
