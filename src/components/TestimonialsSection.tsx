import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatarInitials: string;
  staggerDelay: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role, avatarInitials, staggerDelay }) => {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: staggerDelay, duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} fill="#FFB300" stroke="#FFB300" className="mr-1" />
        ))}
      </div>
      <blockquote className="text-lg italic text-[#0D1B3E] leading-relaxed mb-6">
        "{quote}"
      </blockquote>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[#0D1B3E] font-bold text-lg mr-4">
          {avatarInitials}
        </div>
        <div>
          <p className="font-bold text-[#0D1B3E]">{author}</p>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonialsData = [
    {
      quote: "I used to spend the first three days of every month calling tenants. Now I open BizRent and the dashboard tells me everything. My assistant has more time for actual property management.",
      author: "Mutoni Claudette",
      role: "26 units, Kimihurura",
      avatarInitials: "MC",
    },
    {
      quote: "My landlord clients used to call me on the 3rd of every month demanding collection reports. Now I just share the BizRent link — they see their data in real time. Fewer calls, more trust.",
      author: "Jean-Pierre Habimana",
      role: "Property manager, 65 units",
      avatarInitials: "JH",
    },
    {
      quote: "I had no proof I paid for three months because my landlord lost the WhatsApp messages. With BizRent I get a real PDF receipt every time. I can show my bank, my employer, anyone.",
      author: "Ineza Sandrine",
      role: "Tenant, Gikondo studio",
      avatarInitials: "IS",
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-gray-50">
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
            What Kigali property owners are saying.
          </h2>
        </motion.div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              avatarInitials={testimonial.avatarInitials}
              staggerDelay={0.1 * index}
            />
          ))}
        </div>

        {/* Testimonial Section Visual - Avatar Illustrations Placeholder */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="w-full flex justify-center gap-8">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">Avatar 1</div>
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">Avatar 2</div>
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">Avatar 3</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
