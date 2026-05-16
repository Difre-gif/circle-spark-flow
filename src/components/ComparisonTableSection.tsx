import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from '@react-spring/web';

interface StatBarProps {
  value: string;
  label: string;
  delay: number;
}

const StatBar: React.FC<StatBarProps> = ({ value, label, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const springProps = useSpring({
    from: { number: 0 },
    number: inView ? parseFloat(value.replace(/[^0-9.]/g, '')) : 0,
    config: { mass: 1, tension: 20, friction: 10 },
    delay: delay,
  });

  const formatValue = (num: number) => {
    if (value.includes('M')) return `RWF ${num.toFixed(1)}M`;
    if (value.includes('B')) return `$${num.toFixed(1)}B`;
    return num.toLocaleString();
  };

  return (
    <div ref={ref} className="flex flex-col items-center p-4">
      <animated.div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0D1B3E] to-[#00C853] mb-2">
        {springProps.number.to(num => formatValue(num))}
      </animated.div>
      <p className="text-gray-600 text-lg font-medium">{label}</p>
    </div>
  );
};

const ComparisonTableSection: React.FC = () => {
  const tableData = [
    {
      category: 'Rent tracking',
      oldWay: 'WhatsApp screenshots, manual Excel',
      bizRentWay: 'Live payment dashboard — always current',
    },
    {
      category: 'Fraud protection',
      oldWay: 'None — edited screenshots accepted',
      bizRentWay: 'Transaction ID verification before approval',
    },
    {
      category: 'Receipts',
      oldWay: 'None, or handwritten paper slips',
      bizRentWay: 'Auto-generated PDF on every approval',
    },
    {
      category: 'Audit trail',
      oldWay: 'None',
      bizRentWay: 'Every action logged with actor + timestamp',
    },
    {
      category: 'Monthly reports',
      oldWay: '3-day manual reconciliation',
      bizRentWay: 'One-click CSV/PDF export, always ready',
    },
    {
      category: 'MoMo support',
      oldWay: '❌ Not supported by any SaaS tool',
      bizRentWay: '✓ Built for MTN MoMo from day one',
    },
    {
      category: 'Multi-property',
      oldWay: 'Separate notebook per property',
      bizRentWay: 'All properties, units, tenants in one place',
    },
  ];

  const marketStats = [
    { value: '5.8M', label: 'Active mobile-money users across Rwanda and Kenya' },
    { value: '95B', label: 'Rwanda and Kenya real estate markets' },
    { value: '30', label: 'Year-on-year MoMo revenue growth' },
    { value: '0', label: 'Dedicated MoMo-first property platforms before BizRent' },
  ];

  return (
    <section id="comparison" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-5xl font-extrabold text-[#0D1B3E] mt-4 leading-tight">
            The old way vs. the BizRent way.
          </h2>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          className="overflow-x-auto mb-20 shadow-lg rounded-xl border border-gray-100/50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Old Way (WhatsApp + Excel)
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50 relative rounded-tr-xl">
                  BizRent <span className="absolute inset-y-0 right-0 w-2 bg-green-200 rounded-tr-xl"></span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-gray-100">
              {tableData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0D1B3E]">
                    {row.category}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                    {row.oldWay}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm font-semibold text-[#00C853]">
                    {row.bizRentWay}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Market Stats Bar */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-gray-100 p-8 rounded-2xl shadow-inner"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {marketStats.map((stat, index) => (
            <StatBar
              key={index}
              value={stat.value}
              label={stat.label}
              delay={0.1 * index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTableSection;
