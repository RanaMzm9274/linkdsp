import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowLeft, FileText, Clock, CheckCircle, XCircle, Video, MessageSquare, Building } from 'lucide-react';

type ApplicationStatus = 'pending' | 'under_review' | 'interview_scheduled' | 'accepted' | 'rejected';

interface Application {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  interview_date: string | null;
  interview_link: string | null;
  university: { id: string; name: string; logo_url: string | null };
  program: { id: string; name: string; degree_type: string };
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-warning/10 text-warning', icon: FileText },
  interview_scheduled: { label: 'Interview Scheduled', color: 'bg-purple-500/10 text-purple-500', icon: Video },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export default function Applications() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id, status, created_at, updated_at, admin_notes, interview_date, interview_link,
        university:universities!applications_university_id_fkey(id, name, logo_url),
        program:programs!applications_program_id_fkey(id, name, degree_type)
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Transform the data to handle single objects
      const transformedData = data.map(item => ({
        ...item,
        university: Array.isArray(item.university) ? item.university[0] : item.university,
        program: Array.isArray(item.program) ? item.program[0] : item.program,
      })) as Application[];
      setApplications(transformedData);
    }
    setLoadingApps(false);
  };

  if (loading || loadingApps) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getTimelineSteps = (app: Application) => {
    const steps = [
      { label: 'Submitted', date: new Date(app.created_at).toLocaleDateString(), completed: true },
      { label: 'Under Review', date: app.status !== 'pending' ? new Date(app.updated_at).toLocaleDateString() : null, completed: ['under_review', 'interview_scheduled', 'accepted', 'rejected'].includes(app.status) },
      { label: 'Interview', date: app.interview_date ? new Date(app.interview_date).toLocaleDateString() : null, completed: ['interview_scheduled', 'accepted', 'rejected'].includes(app.status) },
      { label: 'Decision', date: ['accepted', 'rejected'].includes(app.status) ? new Date(app.updated_at).toLocaleDateString() : null, completed: ['accepted', 'rejected'].includes(app.status) },
    ];
    return steps;
  };

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

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground">Track your application status and progress</p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Applications Yet</h2>
            <p className="text-muted-foreground mb-6">Start your journey by applying to your dream university</p>
            <Link to="/universities">
              <Button variant="hero">Browse Universities</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <div className="lg:col-span-2 space-y-4">
              {applications.map((app) => {
                const config = statusConfig[app.status];
                const StatusIcon = config.icon;
                
                return (
                  <div
                    key={app.id}
                    className={`bg-card rounded-2xl border p-6 cursor-pointer transition-all hover:shadow-lg ${selectedApp?.id === app.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/20'}`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                        {app.university?.logo_url ? (
                          <img src={app.university.logo_url} alt={app.university?.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-7 h-7 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{app.university?.name}</h3>
                        <p className="text-sm text-muted-foreground">{app.program?.name} • {app.program?.degree_type}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {config.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interview Card */}
                    {app.status === 'interview_scheduled' && app.interview_date && (
                      <div className="mt-4 p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Video className="w-5 h-5 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Interview Scheduled</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(app.interview_date).toLocaleString()}
                            </p>
                          </div>
                          {app.interview_link && (
                            <a href={app.interview_link} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="hero">Join Call</Button>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {app.admin_notes && (
                      <div className="mt-4 p-4 bg-secondary/50 rounded-xl">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Admin Note</p>
                            <p className="text-sm text-foreground">{app.admin_notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Timeline Detail Panel */}
            <div className="lg:col-span-1">
              {selectedApp ? (
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                  <h3 className="font-semibold text-foreground mb-6">Application Timeline</h3>
                  <div className="space-y-6">
                    {getTimelineSteps(selectedApp).map((step, index) => (
                      <div key={step.label} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                            {step.completed ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-medium">{index + 1}</span>}
                          </div>
                          {index < 3 && (
                            <div className={`w-0.5 h-12 ${step.completed ? 'bg-primary' : 'bg-border'}`} />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                          {step.date && (
                            <p className="text-xs text-muted-foreground mt-1">{step.date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-6 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select an application to view timeline</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
