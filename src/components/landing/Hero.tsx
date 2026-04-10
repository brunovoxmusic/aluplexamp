'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export function Hero() {
  const setView = useStore((s) => s.setView);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Subtle background gradient orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#6d28d9]/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#a78bfa]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#f59e0b]/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div custom={0} variants={fadeInUp} initial="hidden" animate="visible">
              <Badge className="mb-6 px-3 py-1 text-sm bg-[#6d28d9]/10 text-[#6d28d9] border-[#6d28d9]/20 hover:bg-[#6d28d9]/15 dark:bg-[#a78bfa]/10 dark:text-[#a78bfa] dark:border-[#a78bfa]/20">
                <span className="mr-1">✨</span> AI-Powered Productivity
              </Badge>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
            >
              Stop guessing what to do{' '}
              <span className="gradient-text">next.</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0"
            >
              Flowd&apos;s AI plans your day, prioritizes tasks, and builds habits — so you
              focus on what matters.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white h-12 px-8 text-base"
                onClick={() => setView('app')}
              >
                Start Free
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
                onClick={() => {
                  const el = document.querySelector('#ai-demo');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play className="mr-2 size-4" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.p
              custom={4}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mt-4 text-sm text-muted-foreground"
            >
              No credit card required · Free forever plan
            </motion.p>
          </div>

          {/* Right - Dashboard Mockup */}
          <motion.div
            custom={2}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative flex justify-center"
          >
            <div className="float-animation relative">
              {/* Glow border */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#6d28d9]/30 via-[#a78bfa]/20 to-[#f59e0b]/20 blur-sm" />

              {/* Dashboard Card */}
              <div className="relative rounded-2xl border bg-card p-6 shadow-xl max-w-sm w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Today&apos;s Focus</h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Task Items */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-5 h-5 rounded-full border-2 border-[#10b981] bg-[#10b981] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm line-through text-muted-foreground">Review Q2 roadmap</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">urgent</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-5 h-5 rounded-full border-2 border-[#10b981] bg-[#10b981] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm line-through text-muted-foreground">Draft API spec</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">high</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-[#6d28d9]/5 dark:bg-[#6d28d9]/10">
                    <div className="w-5 h-5 rounded-full border-2 border-[#a78bfa] flex items-center justify-center" />
                    <span className="text-sm font-medium">Design system audit</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">medium</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Daily Progress</span>
                    <span className="text-xs font-semibold text-[#6d28d9] dark:text-[#a78bfa]">68%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '68%' }}
                      transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#6d28d9] to-[#a78bfa]"
                    />
                  </div>
                </div>

                {/* AI Insight */}
                <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-[#6d28d9]/5 to-[#a78bfa]/5 border border-[#6d28d9]/10 dark:from-[#a78bfa]/5 dark:to-[#c4b5fd]/5 dark:border-[#a78bfa]/10">
                  <p className="text-xs text-muted-foreground">
                    💡 You&apos;re most productive between <span className="font-semibold text-foreground">9-11 AM</span> — schedule deep work then.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
