import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation

const NavigationBar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50 && !isScrolled) {
      setIsScrolled(true);
    } else if (latest <= 50 && isScrolled) {
      setIsScrolled(false);
    }
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#testimonials' },
  ];

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl bg-white/80 border-b border-gray-100/50' : 'bg-transparent'}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-navy-deep rounded-full flex items-center justify-center">
              {/* BizRent B-with-checkmark icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-xl font-bold">
              <span className="text-[#0D1B3E]">Biz</span>
              <span className="text-[#00C853]">Rent</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[#0D1B3E] relative group"
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                transition={{ delay: 0.05 * index }}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00C853] group-hover:w-full transition-all duration-300"></span>
              </motion.a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="btn-ghost text-sm font-medium text-gray-600 hover:text-[#0D1B3E]">Log in</Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-full bg-[#00C853] text-white text-sm font-medium shadow-md hover:bg-green-600 transition-colors duration-300"
            >
              Get early access →
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#0D1B3E] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00C853]"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white/90 backdrop-blur-md pb-4 border-b border-gray-100 shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#0D1B3E] hover:bg-gray-50"
                  onClick={toggleMobileMenu} // Close menu on link click
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="space-y-1">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#0D1B3E] hover:bg-gray-50"
                    onClick={toggleMobileMenu}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-[#00C853] text-white hover:bg-green-600"
                    onClick={toggleMobileMenu}
                  >
                    Get early access →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavigationBar;
