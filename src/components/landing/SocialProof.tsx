'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, CheckCircle2, TrendingUp, Star } from 'lucide-react';

const stats = [
  { icon: Users, value: '12,847', label: 'users' },
  { icon: CheckCircle2, value: '489,000+', label: 'tasks completed' },
  { icon: TrendingUp, value: '92%', label: 'productivity boost' },
  { icon: Star, value: '4.9★', label: 'rating' },
];

export function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-12 border-y bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <stat.icon className="size-5 mx-auto mb-2 text-[#6d28d9] dark:text-[#a78bfa]" />
              <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
