import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Clock, DollarSign, GraduationCap, ArrowLeft, ArrowRight } from 'lucide-react';

interface University {
  id: string; name: string; country: string; city: string; logo_url: string | null;
  description: string | null; requirements: string | null; deadlines: string | null;
}

interface Program {
  id: string; name: string; department: string | null; degree_type: string;
  duration: string | null; tuition_fee: string | null; description: string | null;
}

export default function UniversityDetail() {
  const { id } = useParams();
  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        supabase.from('universities').select('*').eq('id', id).single(),
        supabase.from('programs').select('*').eq('university_id', id),
      ]).then(([uniRes, progRes]) => {
        if (uniRes.data) setUniversity(uniRes.data);
        if (progRes.data) setPrograms(progRes.data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">University not found</h1>
          <Link to="/universities"><Button variant="outline" className="mt-4">Back to Universities</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <Link to="/universities" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Universities
          </Link>

          {/* Header */}
          <div className="bg-card rounded-2xl border border-border p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 rounded-2xl bg-secondary overflow-hidden flex items-center justify-center">
                {university.logo_url ? (
                  <img src={university.logo_url} alt={university.name} className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{university.name}</h1>
                <div className="flex items-center gap-1 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" /> {university.city}, {university.country}
                </div>
                <p className="text-muted-foreground">{university.description}</p>
              </div>
            </div>
            {university.requirements && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground mb-2">Requirements</h3>
                <p className="text-sm text-muted-foreground">{university.requirements}</p>
              </div>
            )}
            {university.deadlines && (
              <div className="mt-4">
                <span className="inline-flex items-center gap-1 text-sm text-warning font-medium">
                  <Clock className="w-4 h-4" /> Deadline: {university.deadlines}
                </span>
              </div>
            )}
          </div>

          {/* Programs */}
          <h2 className="text-2xl font-bold text-foreground mb-6">Available Programs</h2>
          {programs.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No programs available yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {programs.map((program) => (
                <div key={program.id} className="bg-card rounded-2xl border border-border p-6 hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{program.name}</h3>
                      <p className="text-sm text-muted-foreground">{program.department}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{program.degree_type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{program.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {program.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {program.duration}</span>}
                    {program.tuition_fee && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {program.tuition_fee}</span>}
                  </div>
                  <Link to={`/dashboard/apply?university=${university.id}&program=${program.id}`}>
                    <Button variant="hero" size="sm" className="w-full group">
                      Apply Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
