import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GraduationCap, Search, FileText, Brain, Video, LogOut, User, Bell } from 'lucide-react';

interface StatusCounts {
  pending: number;
  under_review: number;
  interview_scheduled: number;
  accepted: number;
  rejected: number;
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    under_review: 0,
    interview_scheduled: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchApplicationCounts();
    }
  }, [user]);

  const fetchApplicationCounts = async () => {
    const { data } = await supabase
      .from('applications')
      .select('status')
      .eq('user_id', user!.id);

    if (data) {
      const counts: StatusCounts = {
        pending: 0,
        under_review: 0,
        interview_scheduled: 0,
        accepted: 0,
        rejected: 0,
      };
      data.forEach(app => {
        if (counts.hasOwnProperty(app.status)) {
          counts[app.status as keyof StatusCounts]++;
        }
      });
      setStatusCounts(counts);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const quickActions = [
    { icon: Search, label: 'Browse Universities', href: '/universities', color: 'bg-primary/10 text-primary' },
    { icon: FileText, label: 'My Applications', href: '/dashboard/applications', color: 'bg-success/10 text-success' },
    { icon: Brain, label: 'AI Consultation', href: '/dashboard/ai-consultation', color: 'bg-purple-500/10 text-purple-500' },
    { icon: Video, label: 'Interviews', href: '/dashboard/applications', color: 'bg-warning/10 text-warning' },
  ];

  const totalApplications = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">EduPath</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.email?.split('@')[0]}!</h1>
          <p className="text-muted-foreground">Track your applications and discover new opportunities.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <div className="p-6 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Application Status Summary */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Application Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Pending', count: statusCounts.pending, color: 'text-muted-foreground' },
              { label: 'Under Review', count: statusCounts.under_review, color: 'text-warning' },
              { label: 'Interview', count: statusCounts.interview_scheduled, color: 'text-purple-500' },
              { label: 'Accepted', count: statusCounts.accepted, color: 'text-success' },
              { label: 'Rejected', count: statusCounts.rejected, color: 'text-destructive' },
            ].map((status) => (
              <div key={status.label} className="text-center p-4 bg-secondary/50 rounded-xl">
                <div className={`text-2xl font-bold ${status.color}`}>{status.count}</div>
                <div className="text-sm text-muted-foreground">{status.label}</div>
              </div>
            ))}
          </div>
          {totalApplications === 0 && (
            <div className="mt-6 text-center">
              <Link to="/universities">
                <Button variant="hero">Start Your First Application</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
