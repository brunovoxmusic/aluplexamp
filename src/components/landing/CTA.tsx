'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const setView = useStore((s) => s.setView);

  return (
    <section ref={ref} className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-gradient-cta rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden"
        >
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Ready to own your day?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
              Join 12,000+ people who&apos;ve already transformed their productivity with Flowd.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="bg-white text-[#6d28d9] hover:bg-white/90 h-12 px-8 text-base font-semibold"
                onClick={() => setView('app')}
              >
                Get Started Free
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/60">
              No credit card required · Free forever plan
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
