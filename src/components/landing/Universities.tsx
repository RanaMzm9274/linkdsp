import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  logo_url: string | null;
  description: string | null;
}

export function Universities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (!loading && universities.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.university-card',
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [loading, universities]);

  const fetchUniversities = async () => {
    const { data, error } = await supabase
      .from('universities')
      .select('id, name, country, city, logo_url, description')
      .eq('status', 'active')
      .limit(6);

    if (!error && data) {
      setUniversities(data);
    }
    setLoading(false);
  };

  return (
    <section ref={sectionRef} className="py-24 bg-secondary/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Building className="w-4 h-4" />
              Featured Partners
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Top Universities Worldwide
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Explore prestigious institutions across the globe, handpicked for academic excellence.
            </p>
          </div>
          <Link to="/universities">
            <Button variant="outline" className="group">
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Universities Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-2xl border border-border p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-secondary" />
                  <div className="flex-1">
                    <div className="h-5 bg-secondary rounded w-3/4 mb-2" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((university) => (
              <Link
                key={university.id}
                to={`/universities/${university.id}`}
                className="university-card group"
              >
                <div className="h-full bg-card rounded-2xl border border-border p-6 hover:border-primary/20 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-secondary overflow-hidden flex items-center justify-center">
                      {university.logo_url ? (
                        <img
                          src={university.logo_url}
                          alt={university.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {university.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {university.city}, {university.country}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {university.description || 'Discover exceptional programs and opportunities at this renowned institution.'}
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">View programs</span>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
