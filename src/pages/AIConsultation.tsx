import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, ArrowLeft, Brain, Sparkles, Target, MapPin, Briefcase, CheckCircle, Building, Save, Loader2 } from 'lucide-react';

interface Profile {
  education_level: string | null;
  gpa: string | null;
  interests: string[] | null;
  skills: string[] | null;
  preferred_countries: string[] | null;
  budget_range: string | null;
}

interface Recommendations {
  recommended_programs: { name: string; reason: string }[];
  career_suggestions: { title: string; description: string }[];
  recommended_universities: { id: string; name: string; reason: string }[];
  next_steps: string[];
  summary: string;
}

export default function AIConsultation() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    education_level: '',
    gpa: '',
    interests: [],
    skills: [],
    preferred_countries: [],
    budget_range: '',
  });
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [interestsInput, setInterestsInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [countriesInput, setCountriesInput] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPreviousConsultation();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('education_level, gpa, interests, skills, preferred_countries, budget_range')
      .eq('id', user!.id)
      .single();

    if (data) {
      setProfile(data);
      setInterestsInput(data.interests?.join(', ') || '');
      setSkillsInput(data.skills?.join(', ') || '');
      setCountriesInput(data.preferred_countries?.join(', ') || '');
    }
  };

  const fetchPreviousConsultation = async () => {
    const { data } = await supabase
      .from('ai_consultations')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && data.recommendations) {
      setRecommendations(data.recommendations as unknown as Recommendations);
    }
  };

  const updateProfile = (field: keyof Profile, value: string | string[] | null) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateRecommendations = async () => {
    setGenerating(true);

    try {
      // Update profile first
      const updatedProfile = {
        education_level: profile.education_level,
        gpa: profile.gpa,
        interests: interestsInput.split(',').map(s => s.trim()).filter(Boolean),
        skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
        preferred_countries: countriesInput.split(',').map(s => s.trim()).filter(Boolean),
        budget_range: profile.budget_range,
      };

      await supabase.from('profiles').update(updatedProfile).eq('id', user!.id);

      // Fetch universities for context
      const { data: universities } = await supabase
        .from('universities')
        .select('id, name, country, city')
        .eq('status', 'active');

      // Call AI edge function
      const response = await supabase.functions.invoke('ai-consultation', {
        body: { profile: updatedProfile, universities: universities || [] },
      });

      if (response.error) throw response.error;

      const recs = response.data as Recommendations;
      setRecommendations(recs);

      // Save consultation
      await supabase.from('ai_consultations').insert({
        user_id: user!.id,
        recommendations: recs as any,
        career_suggestions: recs.career_suggestions.map(c => c.title),
        recommended_universities: recs.recommended_universities.map(u => u.name),
        next_steps: recs.next_steps,
      });

      toast.success('Recommendations generated successfully!');
    } catch (error: any) {
      console.error('AI Consultation error:', error);
      toast.error(error.message || 'Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">EduPath</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-500" />
              AI Career Consultation
            </h1>
            <p className="text-muted-foreground">Get personalized university and career recommendations</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Form */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Your Profile</h2>
            <div className="space-y-5">
              <div>
                <Label>Education Level</Label>
                <select
                  value={profile.education_level || ''}
                  onChange={(e) => updateProfile('education_level', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">Select level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <Label>GPA / Grades</Label>
                <Input
                  value={profile.gpa || ''}
                  onChange={(e) => updateProfile('gpa', e.target.value)}
                  placeholder="e.g., 3.8/4.0 or A"
                />
              </div>
              <div>
                <Label>Interests</Label>
                <Input
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="e.g., Technology, Business, Medicine"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
              </div>
              <div>
                <Label>Skills</Label>
                <Input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g., Programming, Leadership, Research"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
              </div>
              <div>
                <Label>Preferred Countries</Label>
                <Input
                  value={countriesInput}
                  onChange={(e) => setCountriesInput(e.target.value)}
                  placeholder="e.g., USA, UK, Germany"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
              </div>
              <div>
                <Label>Budget Range</Label>
                <select
                  value={profile.budget_range || ''}
                  onChange={(e) => updateProfile('budget_range', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">Select budget</option>
                  <option value="Under $10,000/year">Under $10,000/year</option>
                  <option value="$10,000 - $25,000/year">$10,000 - $25,000/year</option>
                  <option value="$25,000 - $50,000/year">$25,000 - $50,000/year</option>
                  <option value="Over $50,000/year">Over $50,000/year</option>
                </select>
              </div>

              <Button
                onClick={handleGenerateRecommendations}
                disabled={generating}
                variant="hero"
                className="w-full gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-6">
            {recommendations ? (
              <>
                {/* Summary */}
                <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">AI Analysis</h3>
                  </div>
                  <p className="text-muted-foreground">{recommendations.summary}</p>
                </div>

                {/* Recommended Universities */}
                {recommendations.recommended_universities.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Building className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Recommended Universities</h3>
                    </div>
                    <div className="space-y-3">
                      {recommendations.recommended_universities.map((uni, i) => (
                        <div key={i} className="p-4 bg-secondary/50 rounded-xl">
                          <h4 className="font-medium text-foreground">{uni.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{uni.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career Suggestions */}
                {recommendations.career_suggestions.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-warning" />
                      <h3 className="font-semibold text-foreground">Career Paths</h3>
                    </div>
                    <div className="space-y-3">
                      {recommendations.career_suggestions.map((career, i) => (
                        <div key={i} className="p-4 bg-secondary/50 rounded-xl">
                          <h4 className="font-medium text-foreground">{career.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{career.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Programs */}
                {recommendations.recommended_programs.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-success" />
                      <h3 className="font-semibold text-foreground">Suggested Programs</h3>
                    </div>
                    <div className="space-y-3">
                      {recommendations.recommended_programs.map((prog, i) => (
                        <div key={i} className="p-4 bg-secondary/50 rounded-xl">
                          <h4 className="font-medium text-foreground">{prog.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{prog.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {recommendations.next_steps.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <h3 className="font-semibold text-foreground">Next Steps</h3>
                    </div>
                    <ul className="space-y-2">
                      {recommendations.next_steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-4">
                  Fill in your profile details and let our AI analyze your interests and skills to provide personalized recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
