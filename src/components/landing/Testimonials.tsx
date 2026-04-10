'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote:
      "Flowd's AI saved me 2 hours every day. I finally feel in control of my workload.",
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'Stripe',
  },
  {
    quote:
      'The habit tracking + AI nudges combo is incredible. My consistency went from 40% to 90%.',
    name: 'Marcus Johnson',
    role: 'Freelance Designer',
    company: 'Independent',
  },
  {
    quote:
      "I've tried every productivity app. Flowd is the first one that actually tells me WHAT to do.",
    name: 'Elena Kowalski',
    role: 'Startup Founder',
    company: 'TechNova',
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section id="testimonials" ref={ref} className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Loved by <span className="gradient-text">thousands</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our users are saying about their productivity transformation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <Quote className="size-8 text-[#6d28d9]/20 dark:text-[#a78bfa]/20 mb-4" />
                  <p className="text-sm leading-relaxed flex-1 text-foreground/90">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center text-white text-sm font-semibold">
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.role} at {t.company}
                      </p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className="size-3 fill-[#f59e0b] text-[#f59e0b]"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
