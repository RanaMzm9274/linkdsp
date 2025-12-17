import { useEffect, useRef } from 'react';
import { Search, FileText, Brain, Video, CheckCircle2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: Search,
    title: 'Discover Universities',
    description: 'Browse through 500+ partner universities worldwide. Filter by country, program, or requirements.',
  },
  {
    icon: FileText,
    title: 'Apply Seamlessly',
    description: 'Complete your application in minutes with our guided multi-step form. Upload documents securely.',
  },
  {
    icon: Brain,
    title: 'AI Consultation',
    description: 'Get personalized university and career recommendations based on your profile and goals.',
  },
  {
    icon: Video,
    title: 'Interview & Enroll',
    description: 'Attend virtual interviews directly from your dashboard and track your admission status.',
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            <CheckCircle2 className="w-4 h-4" />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Your Path to Success in{' '}
            <span className="text-gradient">Four Simple Steps</span>
          </h2>
          <p className="text-muted-foreground">
            We've streamlined the entire admission process to help you focus on what matters most—your future.
          </p>
        </div>

        {/* Steps Grid */}
        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="feature-card group relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-border to-transparent" />
              )}
              
              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                {/* Hover arrow */}
                <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
