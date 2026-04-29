'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Clock, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Brain,
    title: 'AI Planning',
    description:
      "Stop deciding what to do. AI analyzes your tasks, deadlines, and habits to create the perfect daily plan.",
    gradient: 'from-[#6d28d9] to-[#a78bfa]',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description:
      "Your tasks adapt to your energy. Flowd learns when you're most productive and schedules accordingly.",
    gradient: 'from-[#a78bfa] to-[#c4b5fd]',
  },
  {
    icon: Flame,
    title: 'Habit Engine',
    description:
      'Build streaks that stick. Track habits, get AI-powered nudges, and watch your consistency grow.',
    gradient: 'from-[#f59e0b] to-[#fbbf24]',
  },
];

export function ValueProps() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section id="features" ref={ref} className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything you need to <span className="gradient-text">own your day</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Three powerful pillars that work together to transform how you work.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <Card className="group relative h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[1px] bg-gradient-to-br from-[#6d28d9] to-[#f59e0b] -z-10" />
                <CardContent className="p-6 lg:p-8">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5`}
                  >
                    <feature.icon className="size-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
