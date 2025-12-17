import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building, Filter, ArrowRight } from 'lucide-react';

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  logo_url: string | null;
  description: string | null;
}

export default function UniversitiesList() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    const { data } = await supabase.from('universities').select('*').eq('status', 'active');
    if (data) setUniversities(data);
    setLoading(false);
  };

  const filtered = universities.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.country.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = !countryFilter || u.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const countries = [...new Set(universities.map((u) => u.country))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Explore Universities</h1>
            <p className="text-muted-foreground">Discover world-class institutions and find your perfect academic match.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search universities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="h-10 px-4 rounded-lg border border-input bg-background text-sm">
              <option value="">All Countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-card rounded-2xl border border-border p-6 h-48" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No universities found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((university) => (
                <Link key={university.id} to={`/universities/${university.id}`} className="group">
                  <div className="h-full bg-card rounded-2xl border border-border p-6 hover:border-primary/20 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-secondary overflow-hidden flex items-center justify-center">
                        {university.logo_url ? (
                          <img src={university.logo_url} alt={university.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{university.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {university.city}, {university.country}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{university.description}</p>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">View programs</span>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
