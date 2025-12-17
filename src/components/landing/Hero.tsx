import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, GraduationCap, Globe, Users } from 'lucide-react';
import gsap from 'gsap';

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1 }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.6'
        )
        .fromTo(
          ctaRef.current?.children || [],
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15 },
          '-=0.4'
        )
        .fromTo(
          statsRef.current?.children || [],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          '-=0.3'
        );

      // Floating animation
      gsap.to(floatingRef.current?.children || [], {
        y: -15,
        duration: 2.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: {
          each: 0.3,
          from: 'random',
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-16"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Floating elements */}
      <div ref={floatingRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <div className="absolute top-1/3 right-[15%] w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-accent" />
        </div>
        <div className="absolute bottom-1/3 left-[20%] w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
          <Users className="w-7 h-7 text-success" />
        </div>
        <div className="absolute bottom-1/4 right-[10%] w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-warning" />
        </div>
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Career Guidance
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
          >
            Your Journey to{' '}
            <span className="text-gradient">World-Class</span>
            <br />
            Education Starts Here
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Discover top universities worldwide, get personalized AI recommendations, 
            and apply seamlessly—all in one platform designed for your success.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="group">
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/universities">
              <Button variant="outline" size="xl">
                Explore Universities
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Partner Universities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">Students Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">120+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
