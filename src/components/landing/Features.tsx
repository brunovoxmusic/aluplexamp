'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ListTodo,
  Target,
  Timer,
  Bell,
  BarChart3,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: ListTodo,
    title: 'Task Management',
    description: 'Organize, prioritize, and delegate tasks with AI-powered suggestions.',
  },
  {
    icon: Target,
    title: 'Habit Tracking',
    description: 'Build daily streaks and get personalized insights on your consistency.',
  },
  {
    icon: Timer,
    title: 'Focus Timer',
    description: 'Pomodoro sessions with AI-suggested break activities.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'AI learns your patterns and knows exactly when to nudge you.',
  },
  {
    icon: BarChart3,
    title: 'Weekly Analytics',
    description: 'See your productivity trends and identify areas for improvement.',
  },
  {
    icon: Users,
    title: 'Team Ready',
    description: 'Share plans and sync with your team (Pro feature).',
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Packed with <span className="gradient-text">smart features</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to save you time and keep you in the zone.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#6d28d9]/10 dark:bg-[#a78bfa]/10 flex items-center justify-center mb-4">
                    <feature.icon className="size-5 text-[#6d28d9] dark:text-[#a78bfa]" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
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
