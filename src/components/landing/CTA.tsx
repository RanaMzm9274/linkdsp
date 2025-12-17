import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-content',
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-secondary/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="cta-content relative overflow-hidden rounded-3xl bg-gradient-primary p-8 sm:p-12 lg:p-16">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Start Your Journey Today
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Shape Your Future?
            </h2>

            {/* Subtitle */}
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have already started their journey to world-class education. 
              Create your free account and get personalized recommendations today.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button
                  variant="secondary"
                  size="xl"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/universities">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Explore Universities
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 pt-8 border-t border-white/20">
              <p className="text-sm text-white/60 mb-4">Trusted by students from</p>
              <div className="flex items-center justify-center gap-8 opacity-80">
                <span className="text-white font-semibold">Harvard</span>
                <span className="text-white font-semibold">Oxford</span>
                <span className="text-white font-semibold">MIT</span>
                <span className="text-white font-semibold">Stanford</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
