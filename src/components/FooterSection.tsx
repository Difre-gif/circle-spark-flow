import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FooterSection: React.FC = () => {
  return (
    <motion.footer
      className="bg-gray-100 py-16 text-gray-600"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: BizRent Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-navy-deep rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="#0D1B3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-xl font-bold">
                <span className="text-[#0D1B3E]">Biz</span>
                <span className="text-[#00C853]">Rent</span>
              </div>
            </Link>
            <p className="text-sm mb-2">Stop chasing. Start collecting.</p>
            <p className="text-xs mb-1">Rwanda & Kenya</p>
            <p className="text-xs">Founded by Fredrick Kariuki (Kenya) & Axel Karambizi (Rwanda)</p>
          </div>

          {/* Column 2: Product Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#0D1B3E] mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm hover:text-white transition-colors">Features</a></li>
              <li><a href="#how" className="text-sm hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#pricing" className="text-sm hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#security" className="text-sm hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>

          {/* Column 3: Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#0D1B3E] mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-sm hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-sm hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/press" className="text-sm hover:text-white transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#0D1B3E] mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 text-center text-xs">
          <p>© 2026 BizRent — East Africa's MoMo-First Property Management Platform.</p>
          <p>Co-founded by Fredrick Kariuki (Kenya) & Axel Karambizi (Rwanda).</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default FooterSection;
