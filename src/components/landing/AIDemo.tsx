'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const conversation: ChatMessage[] = [
  {
    role: 'user',
    content: 'I have 5 tasks, 3 meetings, and 2 hours of deep work time.',
  },
  {
    role: 'assistant',
    content: `Here's your optimized schedule:

🕐 9:00 AM — Deep Work: Highest priority task
🕐 9:50 AM — Break (10 min)
🕐 10:00 AM — Meeting: Sprint planning
🕐 10:45 AM — Deep Work: Second priority task
🕐 11:35 AM — Break (10 min)
🕐 11:45 AM — Meeting: Design review
🕐 12:30 PM — Lunch break
🕐 1:30 PM — Meeting: 1:1 with manager
🕐 2:00 PM — Task batch: 3 quick items
🕐 3:00 PM — Buffer time / wrap up

💡 Tip: Your 2 hours of deep work are placed in your peak focus window (9-11 AM) for maximum output.`,
  },
];

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text, started]);

  return (
    <span>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 bg-[#6d28d9] dark:bg-[#a78bfa] ml-0.5 animate-pulse" />
      )}
    </span>
  );
}

export function AIDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isInView) return;
    const timer1 = setTimeout(() => {
      setMessages([conversation[0]]);
      setCurrentMsgIndex(1);
    }, 500);
    const timer2 = setTimeout(() => {
      setMessages([...conversation]);
      setCurrentMsgIndex(2);
    }, 1800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isInView]);

  return (
    <section id="ai-demo" ref={ref} className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            See AI <span className="gradient-text">in action</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch Flowd plan a perfect day in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Flowd AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-[#6d28d9] text-white rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'assistant' && i === messages.length - 1 && currentMsgIndex === 2 ? (
                        <TypewriterText text={msg.content} delay={200} />
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                    AI assistant loading...
                  </div>
                )}
              </div>

              {/* Input (decorative) */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask Flowd AI anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1"
                    disabled
                  />
                  <Button
                    size="icon"
                    className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white shrink-0"
                    disabled
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Try the full experience — sign up free above
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
