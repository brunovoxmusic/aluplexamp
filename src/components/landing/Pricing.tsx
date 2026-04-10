'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/lib/store';

interface PlanFeature {
  text: string;
  included: boolean;
}

const freeFeatures: PlanFeature[] = [
  { text: 'AI Planning (5/day)', included: true },
  { text: '3 habits', included: true },
  { text: 'Basic analytics', included: true },
  { text: 'Focus timer', included: true },
  { text: 'Unlimited AI', included: false },
  { text: 'Advanced analytics', included: false },
  { text: 'Team features', included: false },
];

const proFeatures: PlanFeature[] = [
  { text: 'Unlimited AI planning', included: true },
  { text: 'Unlimited habits', included: true },
  { text: 'Advanced analytics', included: true },
  { text: 'Focus timer with AI breaks', included: true },
  { text: 'Priority support', included: true },
  { text: 'Team features', included: true },
  { text: 'Custom integrations', included: true },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const setView = useStore((s) => s.setView);
  const setIsPro = useStore((s) => s.setIsPro);

  return (
    <section id="pricing" ref={ref} className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you&apos;re ready.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full bg-muted">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly
                  ? 'bg-white dark:bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly
                  ? 'bg-white dark:bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#10b981] text-white">Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Free</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {freeFeatures.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm">
                      {f.included ? (
                        <Check className="size-4 text-[#10b981] shrink-0" />
                      ) : (
                        <div className="size-4 rounded-full border border-muted-foreground/30 shrink-0" />
                      )}
                      <span className={f.included ? '' : 'text-muted-foreground'}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsPro(false);
                    setView('app');
                  }}
                >
                  Get Started Free
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="h-full relative border-2 border-[#6d28d9] dark:border-[#a78bfa]">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6d28d9] text-white border-[#6d28d9]">
                <Sparkles className="size-3 mr-1" />
                Popular
              </Badge>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${isYearly ? '7' : '9'}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-muted-foreground">
                    Billed annually (${(7 * 12).toFixed(0)}/year)
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {proFeatures.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm">
                      <Check className="size-4 text-[#10b981] shrink-0" />
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white"
                  onClick={() => {
                    setIsPro(true);
                    setView('app');
                  }}
                >
                  Start Pro Trial
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
